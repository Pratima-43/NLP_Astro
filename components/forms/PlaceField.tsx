"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { CircleAlert, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { INPUT_CLASS } from "@/components/ui/Field";
import { apiFetch } from "@/lib/api";
import { shortPlace } from "@/lib/format";
import type { GeocodeResult } from "@/types/readings";

/**
 * Type a town, press Search, tap the right one. The chosen name is what the birth chart uses.
 * If the lookup service is down, the typed name can be used as it is.
 */
export function PlaceField({ initial, error, onChange }: { initial: string; error?: string | null; onChange: (place: string) => void }) {
  const id = useId();
  const [query, setQuery] = useState(initial ? shortPlace(initial) : "");
  const [chosen, setChosen] = useState(initial);
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [problem, setProblem] = useState("");

  function choose(place: string) {
    setChosen(place);
    onChange(place);
  }

  async function search() {
    const q = query.trim();
    if (q.length < 2) {
      setProblem("Please type at least two letters of the town or city.");
      return;
    }
    setProblem("");
    setSearching(true);
    try {
      const found = await apiFetch<GeocodeResult[]>(`/astrology/geocode?q=${encodeURIComponent(q)}`);
      setResults(found);
      if (found.length === 0) setProblem(`We couldn’t find “${q}”. Try the nearest big town, or add the state or country.`);
    } catch {
      setResults([]);
      setProblem("The place finder isn’t answering right now. You can try again, or use the name as you typed it.");
    } finally {
      setSearching(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void search();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-base font-semibold text-ink-2">Town or city</label>
        <div className="flex gap-2">
          <input
            id={id}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            placeholder="e.g. Nellore, Andhra Pradesh"
            aria-invalid={Boolean(error)}
            className={`${INPUT_CLASS} min-w-0 flex-1`}
          />
          <Button onClick={() => void search()} busy={searching} size="lg" className="shrink-0 px-5" icon={<Search className="h-5 w-5" aria-hidden="true" />}>
            Search
          </Button>
        </div>
      </div>

      {results && results.length > 0 && (
        <div role="radiogroup" aria-label="Choose your birth place" className="flex flex-col gap-2">
          <p className="text-base font-semibold text-ink">Tap the right place:</p>
          {results.map((r) => {
            const active = chosen === r.name;
            return (
              <button
                key={`${r.name}-${r.latitude}`}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choose(r.name)}
                className={`flex min-h-14 items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left ${active ? "border-ink bg-ink text-moon" : "border-line-2 bg-surface hover:border-ink"}`}
              >
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex flex-col">
                  <span className="text-lg font-semibold">{shortPlace(r.name)}</span>
                  <span className={`text-sm ${active ? "text-white/80" : "text-ink-3"}`}>{r.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {chosen && !(results && results.some((r) => r.name === chosen)) && (
        <p className="flex items-center gap-2 rounded-xl bg-good-soft px-4 py-3 text-lg text-[#14532d]">
          <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Chosen: <strong>{shortPlace(chosen)}</strong></span>
        </p>
      )}

      {problem && (
        <div className="flex flex-col gap-2">
          <p className="flex items-start gap-2 text-base font-medium text-care">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            {problem}
          </p>
          {query.trim().length >= 2 && (
            <Button variant="secondary" onClick={() => choose(query.trim())} className="self-start">
              Use “{query.trim()}” as it is
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-start gap-2 text-base font-medium text-bad" role="alert">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
