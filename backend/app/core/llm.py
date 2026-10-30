"""Shared Groq access for every module.

All generation in this project is *grounded*: callers pass source records and validate any
record IDs the model cites. This helper only handles transport, JSON mode, and one retry.
"""
import hashlib
import json
import logging
import re
import threading
import time
from functools import lru_cache
from typing import Any

from groq import BadRequestError, Groq, RateLimitError

from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMUnavailable(RuntimeError):
    pass


@lru_cache(maxsize=1)
def _client() -> Groq:
    if not settings.groq_api_key:
        raise LLMUnavailable("GROQ_API_KEY is not configured.")
    return Groq(api_key=settings.groq_api_key, timeout=60.0, max_retries=0)


def llm_available() -> bool:
    return bool(settings.groq_api_key and settings.groq_model)


def normalize_text(value: str) -> str:
    """Normalize typographic Unicode characters for consistent display."""
    return (
        value.replace(" ", " ").replace(" ", " ")
        .replace("‑", "-").replace("‐", "-").strip()
    )


def _parse_json(content: str) -> dict[str, Any]:
    content = content.strip()
    if content.startswith("```"):
        content = content.strip("`")
        content = content[content.find("{"):]
    start, end = content.find("{"), content.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model response did not contain a JSON object.")
    parsed = json.loads(content[start:end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("Model response must be a JSON object.")
    return parsed


_RETRY_AFTER = re.compile(r"try again in (?:(\d+)m)?([\d.]+)s", re.IGNORECASE)
MAX_RATE_LIMIT_WAIT_SECONDS = 65.0
RATE_LIMIT_ATTEMPTS = 5


class _TokenBudget:
    """Process-wide sliding-window budget for Groq's tokens-per-minute limit.

    Groq counts a request as prompt tokens plus `max_completion_tokens`. Reserving that estimate
    before each call queues concurrent requests (parallel numerology components, chat and reports)
    instead of letting them collide and burn retries. Other processes are handled by the 429 retry.
    """

    def __init__(self, limit_per_minute: int) -> None:
        self.limit = limit_per_minute
        self.window: list[tuple[float, int]] = []
        self.lock = threading.Lock()

    def reserve(self, tokens: int) -> None:
        tokens = min(tokens, self.limit)
        while True:
            with self.lock:
                now = time.monotonic()
                self.window = [(t, n) for t, n in self.window if now - t < 60]
                used = sum(n for _, n in self.window)
                if used + tokens <= self.limit:
                    self.window.append((now, tokens))
                    return
                wait = 60 - (now - self.window[0][0]) + 0.2
            time.sleep(max(0.2, min(wait, 5.0)))


_budget = _TokenBudget(settings.groq_tokens_per_minute)


def _estimate_tokens(request_args: dict[str, Any]) -> int:
    prompt_chars = sum(len(m["content"]) for m in request_args["messages"])
    return int(prompt_chars / 3.2) + int(request_args.get("max_completion_tokens", 1000))


def _create(request_args: dict[str, Any], **extra: Any) -> Any:
    """Call Groq within the token budget, waiting out any remaining tokens-per-minute limits."""
    for attempt in range(RATE_LIMIT_ATTEMPTS):
        _budget.reserve(_estimate_tokens(request_args))
        try:
            return _client().chat.completions.create(**request_args, **extra)
        except RateLimitError as exc:
            match = _RETRY_AFTER.search(str(exc))
            wait = (int(match.group(1) or 0) * 60 + float(match.group(2))) if match else 10.0
            if attempt == RATE_LIMIT_ATTEMPTS - 1 or wait > MAX_RATE_LIMIT_WAIT_SECONDS:
                raise
            logger.warning("Groq rate limit reached; waiting %.1fs before retrying.", wait)
            time.sleep(wait + 0.5)
    raise RuntimeError("unreachable")


def _cache_get(key: str) -> dict[str, Any] | None:
    from app.db.models import LLMCacheEntry
    from app.db.session import SessionLocal
    try:
        with SessionLocal() as db:
            row = db.get(LLMCacheEntry, key)
            return json.loads(row.response_json) if row else None
    except Exception:  # cache is an optimisation; never fail a reading because of it
        logger.warning("LLM cache read failed", exc_info=True)
        return None


def _cache_put(key: str, namespace: str, value: dict[str, Any]) -> None:
    from app.db.models import LLMCacheEntry
    from app.db.session import SessionLocal
    try:
        with SessionLocal() as db:
            db.merge(LLMCacheEntry(cache_key=key, namespace=namespace, response_json=json.dumps(value, ensure_ascii=False)))
            db.commit()
    except Exception:
        logger.warning("LLM cache write failed", exc_info=True)


def generate_json(
    system_prompt: str,
    user_payload: Any,
    *,
    max_tokens: int = 1400,
    temperature: float = 0.3,
    cache_namespace: str | None = None,
) -> dict[str, Any]:
    """Return the model's JSON object. With `cache_namespace`, identical grounded inputs reuse a
    previous answer; callers must therefore keep person-specific details out of cached payloads."""
    if not settings.groq_model:
        raise LLMUnavailable("GROQ_MODEL is not configured.")
    user_content = user_payload if isinstance(user_payload, str) else json.dumps(user_payload, ensure_ascii=False, sort_keys=True)

    cache_key = None
    if cache_namespace:
        cache_key = hashlib.sha256(f"{cache_namespace}\x00{settings.groq_model}\x00{system_prompt}\x00{user_content}".encode()).hexdigest()
        cached = _cache_get(cache_key)
        if cached is not None:
            return cached

    request_args: dict[str, Any] = {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        "temperature": temperature,
        "max_completion_tokens": max_tokens,
    }
    if settings.groq_model.startswith("openai/gpt-oss"):
        # Reasoning tokens count against the per-minute budget; editing grounded records needs little.
        request_args["reasoning_effort"] = "low"
    try:
        response = _create(request_args, response_format={"type": "json_object"})
    except BadRequestError as exc:
        if "json_validate_failed" not in str(exc).lower():
            raise
        logger.warning("Groq rejected constrained JSON; retrying without response_format.")
        response = _create({**request_args, "max_completion_tokens": max_tokens * 2})

    content = response.choices[0].message.content
    if not content:
        raise ValueError(f"The model returned empty content (finish reason: {response.choices[0].finish_reason}).")
    try:
        parsed = _parse_json(content)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Invalid JSON returned by Groq: %r", content[:2000])
        raise ValueError("Groq returned invalid JSON.") from exc
    if cache_key and cache_namespace:
        _cache_put(cache_key, cache_namespace, parsed)
    return parsed


def clean_cited_items(items: Any, allowed_ids: set[str], *, extra_keys: tuple[str, ...] = ()) -> list[dict[str, Any]]:
    """Keep only items whose text is non-empty and which cite at least one known record ID."""
    if not isinstance(items, list):
        return []
    cleaned = []
    for item in items:
        if not isinstance(item, dict):
            continue
        text = item.get("text")
        ids = item.get("record_ids", [])
        if not isinstance(text, str) or not text.strip() or not isinstance(ids, list):
            continue
        valid_ids = list(dict.fromkeys(i for i in ids if isinstance(i, str) and i in allowed_ids))
        if not valid_ids:
            continue
        out = {"text": normalize_text(text), "record_ids": valid_ids}
        for key in extra_keys:
            if isinstance(item.get(key), str):
                out[key] = normalize_text(item[key])
        cleaned.append(out)
    return cleaned
