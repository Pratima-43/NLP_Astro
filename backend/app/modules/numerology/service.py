from concurrent.futures import ThreadPoolExecutor
from datetime import date
import json
import logging

from sqlalchemy.orm import Session

from app.core.llm import llm_available
from app.db.models import NumerologyReport
from app.modules.numerology.calculations import calculate_all
from app.modules.numerology.knowledge_base.repository import retrieve_records
from app.modules.numerology.interpretation_generator import (
    empty_component_result,
    evidence_layer,
    generate_component_interpretation,
    generate_profile_synthesis,
)

logger = logging.getLogger(__name__)

RECORD_FIELDS = (
    "record_id", "number", "compound_number", "planet", "numerology_component", "target_year",
    "context", "category", "trait", "claim", "polarity", "source_name", "source_url",
    "source_wording", "claim_type", "verification_status",
)


def _record_dict(record, component: str) -> dict:
    data = {field: getattr(record, field) for field in RECORD_FIELDS}
    data["evidence_layer"] = evidence_layer(data, component)
    return data


def build_report(
    db: Session,
    full_name: str,
    dob: date,
    target_year: int,
    context: str | None = None,
    owner_key: str | None = None,
) -> dict:
    result = calculate_all(full_name, dob, target_year)
    components = result["components"]

    retrieved: dict[str, list[dict]] = {}
    for component, calculation in components.items():
        records = retrieve_records(
            db,
            component=component,
            number=calculation["number"],
            compound_number=calculation.get("compound_number"),
            context=context,
            target_year=target_year if component == "personal_year" else None,
        )
        retrieved[component] = [_record_dict(record, component) for record in records]

    generated: dict[str, dict] = {}
    synthesis: dict = {"generation_status": "unavailable"}
    if llm_available():
        def run_component(component: str) -> tuple[str, dict]:
            calculation = components[component]
            try:
                return component, generate_component_interpretation(
                    component=component,
                    number=calculation["number"],
                    compound_number=calculation.get("compound_number"),
                    records=retrieved[component],
                    full_name=full_name,
                    target_year=target_year,
                    calculation=calculation,
                    context=context,
                )
            except Exception:
                logger.exception("Interpretation generation failed for component %s", component)
                return component, empty_component_result("generation_failed")

        def run_synthesis() -> dict:
            try:
                return generate_profile_synthesis(
                    full_name=full_name, target_year=target_year,
                    components=components, records_by_component=retrieved,
                )
            except Exception:
                logger.exception("Profile synthesis failed")
                return {"generation_status": "generation_failed"}

        # Five independent Groq calls, run with limited concurrency so a cold cache stays within the
        # provider's tokens-per-minute budget; rate-limit waits are handled in app.core.llm.
        with ThreadPoolExecutor(max_workers=3) as pool:
            synthesis_future = pool.submit(run_synthesis)
            generated = dict(pool.map(run_component, components))
            synthesis = synthesis_future.result()
    else:
        generated = {component: empty_component_result("llm_not_configured") for component in components}

    # The calculation steps are deterministic, so they are shown even when generation failed.
    for component, reading in generated.items():
        reading.setdefault("explanation", {})["how_calculated"] = " ".join(components[component].get("steps", []))

    result["interpretations"] = retrieved
    result["generated_interpretations"] = generated
    result["synthesis"] = synthesis
    result["context"] = context or "general"
    result["interpretation_coverage"] = {
        component: "source_records_available" if records else "no_source_record_available"
        for component, records in retrieved.items()
    }
    result["evidence_summary"] = {
        component: {
            layer: sum(1 for r in records if r["evidence_layer"] == layer)
            for layer in ("compound_birth_date", "component_specific", "general_number", "context_specific")
        }
        for component, records in retrieved.items()
    }
    result["disclaimer"] = (
        "Numerology is a traditional belief system, not a scientifically validated method of "
        "assessing personality or predicting events. Interpretations are paraphrased from the "
        "project's source-backed knowledge base; missing source support is never filled with invented claims."
    )

    report = NumerologyReport(
        user_id=owner_key, full_name=full_name, date_of_birth=dob,
        target_year=target_year, result_json=json.dumps(result, ensure_ascii=False),
    )
    db.add(report)
    db.commit()
    result["report_id"] = report.id
    return result
