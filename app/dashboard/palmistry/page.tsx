"use client";

import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Brain, Briefcase, Camera, Download, Eye, EyeOff, Hand, Heart, Layers, Lightbulb, Palette, ScanLine, Sparkles, Upload, UserRound, X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { apiFetch, getLatest } from "@/lib/api";
import { dataUrlToFile } from "@/lib/image";
import {
  CalculationGate, PrintButton, Disclaimer, ErrorBanner, EvidenceTable, LoadingStages, PageHero, PredictionCard, ReadingSections, SectionTitle,
} from "@/components/readings/ReadingUI";
import type { EvidenceItem, PalmReading } from "@/types/readings";

const SECTION_ICONS = { personality: UserRound, relationships: Heart, career: Briefcase, education: Brain, creativity: Palette, health: Activity };
const DEV_STYLE: Record<string, string> = {
  prominent: "bg-success/10 text-success", average: "bg-border/60 text-text-secondary", flat: "bg-error/10 text-error", not_visible: "bg-border/40 text-text-secondary",
};
const PHOTO_TIPS = ["Open palm, fingers together, pointing up", "Even daylight, no harsh shadows or flash glare", "Palm fills most of the frame and is in sharp focus"];

function PalmOverlay({ imageUrl, reading }: { imageUrl: string; reading: PalmReading }) {
  const [show, setShow] = useState({ lines: true, traces: false, mounts: true, landmarks: false });
  const [hover, setHover] = useState<string | null>(null);
  const { overlay, landmarks } = reading.analysis;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-navy border border-border p-2 flex justify-center">
      <div className="relative w-fit max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL of the user's own photo */}
        <img src={imageUrl} alt="Your palm with detected lines" className="block max-h-[460px] w-auto max-w-full rounded-xl" />
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {show.mounts && overlay.mounts.map((m) => (
            <ellipse key={m.key} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill={hover === m.key ? "rgba(198,161,91,0.28)" : "rgba(198,161,91,0.10)"}
              stroke="#E8C77E" strokeWidth={1.5} strokeDasharray={m.development === "average" ? "4 3" : undefined} vectorEffect="non-scaling-stroke"
              onMouseEnter={() => setHover(m.key)} onMouseLeave={() => setHover(null)} />
          ))}
          {show.traces && overlay.lines.map((l) => (
            <polyline key={`t-${l.key}`} points={l.trace.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}
          {show.lines && overlay.lines.filter((l) => l.detected).map((l) => (
            <g key={l.key} onMouseEnter={() => setHover(l.key)} onMouseLeave={() => setHover(null)}>
              <polyline points={l.points.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={hover === l.key ? 9 : 7} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <polyline points={l.points.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={l.color} strokeWidth={hover === l.key ? 5 : 3.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
          {show.landmarks && landmarks.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={0.006} fill="#fff" stroke="#171B2D" strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
        </svg>
        {/* Mounts sit close together on small hands, so only the hovered label is drawn. */}
        {show.mounts && overlay.mounts.filter((m) => m.key === hover).map((m) => (
          <span key={m.key} style={{ left: `${m.cx * 100}%`, top: `${m.cy * 100}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap bg-navy text-gold shadow-lg">
            {m.name} · {m.development.replace("_", " ")}
          </span>
        ))}
      </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {([["lines", "Lines", ScanLine], ["mounts", "Mounts", Layers], ["traces", "Traced course", Eye], ["landmarks", "Landmarks", Hand]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
            className={`text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${show[key] ? "border-gold bg-gold/10 text-gold-dark" : "border-border text-text-secondary"}`}>
            {show[key] ? <Icon className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}{label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {overlay.lines.filter((l) => l.detected).map((l) => (
          <span key={l.key} className="text-xs text-text-secondary flex items-center gap-1.5" onMouseEnter={() => setHover(l.key)} onMouseLeave={() => setHover(null)}>
            <span className="w-4 h-1 rounded-full" style={{ background: l.color }} />{l.name}
          </span>
        ))}
        {overlay.lines.some((l) => !l.detected) && (
          <span className="text-xs text-text-secondary">Not clear in this photo: {overlay.lines.filter((l) => !l.detected).map((l) => l.name.replace(" line", "")).join(", ")}</span>
        )}
      </div>
      {show.mounts && (
        <div className="flex flex-wrap gap-1.5">
          {overlay.mounts.map((m) => (
            <button key={m.key} onMouseEnter={() => setHover(m.key)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(m.key)} onBlur={() => setHover(null)}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${hover === m.key ? "border-gold bg-gold/15 text-gold-dark" : "border-border text-text-secondary"}`}>
              {m.name.replace("Mount of the ", "").replace("Mount of ", "")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PalmistryPage() {
  const { user, palmImageUrl } = useApp();
  const [hand, setHand] = useState<"left" | "right">(user?.dominantHand ?? "right");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<PalmReading | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getLatest<PalmReading>("/palmistry/latest").then((saved) => saved && setResult(saved)).catch(() => undefined);
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function choose(selected: File | undefined) {
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) { setError("Please choose a JPEG, PNG or WebP photo."); return; }
    if (selected.size > 8 * 1024 * 1024) { setError("Please choose a photo under 8 MB."); return; }
    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function loadSavedPhoto() {
    if (!palmImageUrl) return;
    try {
      choose(await dataUrlToFile(palmImageUrl, "saved-palm.jpg"));
    } catch {
      setError("Your saved photo could not be loaded. Please upload it again.");
    }
  }

  async function analyse() {
    if (!file || !preview) return;
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("hand", hand);
      const reading = await apiFetch<PalmReading>("/palmistry/analyze", { method: "POST", body: form });
      setResult(reading);
      setResultImage(preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read this palm right now.");
    } finally {
      setLoading(false);
    }
  }

  const evidence = useMemo(() => Object.fromEntries((result?.evidence ?? []).map((e) => [e.evidence_id, e])) as Record<string, EvidenceItem>, [result]);
  const reading = result?.interpretation;
  const geometry = result?.analysis.geometry;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <PageHero icon={Hand} eyebrow="Palmistry · Chirology" title="Read the Lines of Your Hand"
        subtitle="Computer vision finds your hand, traces the heart, head, life, fate and sun lines, locates the mounts, and reads them through Cheiro's classic Palmistry for All." />

      <div className="no-print bg-card rounded-2xl border border-border p-4 sm:p-5 card-shadow grid grid-cols-1 sm:grid-cols-[13rem_1fr] gap-5">
        <div onDragOver={(e: DragEvent) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e: DragEvent) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0]); }}
          className={`relative h-60 w-full sm:w-52 mx-auto rounded-xl border-2 border-dashed transition-colors overflow-hidden flex items-center justify-center ${dragging ? "border-gold bg-gold/5" : preview ? "border-transparent bg-navy" : "border-border bg-ivory hover:border-gold/50"}`}>
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={preview} alt="Selected palm" className="h-full w-full object-contain" />
              <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 bg-gradient-to-t from-navy/90 to-transparent">
                <button onClick={() => inputRef.current?.click()} className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-white/15 text-white backdrop-blur hover:bg-white/25">Change photo</button>
                <button onClick={() => { setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = ""; }} className="w-8 rounded-lg bg-white/15 text-white flex items-center justify-center hover:bg-white/25" aria-label="Remove photo"><X className="w-3.5 h-3.5" /></button>
              </div>
            </>
          ) : (
            <button onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2.5 p-4 text-center w-full h-full justify-center">
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-gold/30"><Upload className="w-5 h-5 text-white" /></div>
              <p className="text-sm font-semibold text-text leading-snug">Drop your palm photo<br />or click to browse</p>
              <p className="text-[10px] text-text-secondary">JPEG · PNG · WebP · max 8 MB</p>
              {palmImageUrl && (
                <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); loadSavedPhoto(); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); loadSavedPhoto(); } }}
                  className="text-[11px] font-semibold text-gold-dark underline underline-offset-2 hover:text-gold">Use my saved palm photo</span>
              )}
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => choose(e.target.files?.[0])} />
        </div>
        <div className="flex flex-col gap-4 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-text mb-2">Which hand is this?</p>
              <div className="inline-flex w-full p-1 rounded-xl bg-ivory border border-border">
                {(["left", "right"] as const).map((h) => (
                  <button key={h} onClick={() => setHand(h)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${hand === h ? "bg-white text-gold-dark shadow-sm" : "text-text-secondary hover:text-text"}`}>{h} hand</button>
                ))}
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">Cheiro reads the left hand for inherited tendencies, the right for what you have developed.</p>
            </div>
            <div className="rounded-xl bg-ivory/70 border border-border p-3">
              <p className="text-xs font-semibold text-text mb-1.5 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-gold" />For best results</p>
              <ul className="space-y-1">{PHOTO_TIPS.map((t) => <li key={t} className="text-[11px] text-text-secondary flex gap-2"><span className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />{t}</li>)}</ul>
            </div>
          </div>
          <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <button onClick={analyse} disabled={!file || loading} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-gradient text-white font-semibold shadow-md shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed">
              <ScanLine className="w-4 h-4" />{loading ? "Reading your palm…" : "Analyse my palm"}
            </button>
            <p className="text-[11px] text-text-secondary">{file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : "Your photo is analysed, never stored."}</p>
          </div>
          <ErrorBanner message={error} />
        </div>
      </div>

      {loading && <LoadingStages stages={["Finding 21 hand landmarks", "Aligning the palm to a standard frame", "Enhancing creases with ridge filters", "Tracing the principal lines", "Measuring mounts and hand shape", "Writing your reading from Cheiro's rules"]} />}

      {result && !loading && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex justify-end -mb-2"><PrintButton /></div>
          {result.analysis.warnings?.map((w) => <p key={w} className="text-xs rounded-xl bg-gold/10 border border-gold/30 text-gold-dark p-3">{w}</p>)}
          {result.reused && <p className="text-xs rounded-xl bg-navy/5 border border-navy/10 text-navy p-3">This is the same photo you analysed before, so your saved reading is shown unchanged.</p>}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
            <div>
              {resultImage ? <PalmOverlay imageUrl={resultImage} reading={result} />
                : <div className="rounded-2xl border border-border bg-ivory p-6 text-sm text-text-secondary text-center">Your photo is never stored, so the marked-up view appears only right after an analysis. Upload the photo again to see the lines drawn on it.</div>}
              {result.annotated_image && resultImage && (
                <a href={result.annotated_image} download="palm-reading.jpg" className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold-dark hover:text-gold"><Download className="w-3.5 h-3.5" />Download marked-up photo</a>
              )}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-[#FFFDF8] to-[#F3EBDD] p-6 card-shadow">
                <p className="text-xs uppercase tracking-[0.2em] text-gold-dark font-semibold mb-2">{result.hand} hand · {geometry?.element} hand</p>
                <h2 className="text-2xl font-bold text-text leading-tight">{reading?.headline || "Your Palm Reading"}</h2>
                {reading?.overview && <p className="mt-3 text-text-secondary leading-relaxed text-[15px]">{reading.overview}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(result.analysis.lines).map((line) => (
                  <div key={line.key} className={`rounded-xl border p-3.5 bg-card ${line.detected ? "border-border" : "border-dashed border-border opacity-75"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-text flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: line.color }} />{line.name}</p>
                      <span className={`text-[10px] font-bold uppercase ${line.detected ? "text-success" : "text-text-secondary"}`}>{line.detected ? "detected" : "not clear"}</span>
                    </div>
                    {line.detected ? (
                      <div className="flex flex-wrap gap-1">
                        {[`${line.length_palm_widths} palm-widths`, line.depth, line.curvature, line.breaks ? `${line.breaks} break${line.breaks > 1 ? "s" : ""}` : "unbroken", line.forked_end ? "forked" : null].filter(Boolean).map((tag) => (
                          <span key={tag as string} className="text-[11px] px-2 py-0.5 rounded-full bg-ivory border border-border text-text-secondary">{tag}</span>
                        ))}
                      </div>
                    ) : <p className="text-[11px] text-text-secondary">{line.reason ?? "Too faint to measure reliably in this photo."}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {reading?.predictions && reading.predictions.length > 0 && (
            <div className="space-y-3">
              <SectionTitle icon={Lightbulb} title="What your hand suggests" subtitle="Traditional tendencies, each with its confidence and the measured features behind it." />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{reading.predictions.map((p, i) => <PredictionCard key={i} prediction={p} evidence={evidence} />)}</div>
            </div>
          )}

          {reading?.sections && reading.sections.length > 0 && (
            <div className="space-y-3"><SectionTitle icon={Sparkles} title="Your reading" /><ReadingSections sections={reading.sections} evidence={evidence} icons={SECTION_ICONS} /></div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <SectionTitle icon={Layers} title="The mounts" subtitle="Estimated from shading and crease density in a 2D photo — treat as indicative." />
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(result.analysis.mounts).map(([key, m]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="text-sm text-text">{m.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${DEV_STYLE[m.development]}`}>{m.development.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
            {geometry && (
              <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
                <SectionTitle icon={Hand} title="Hand shape & fingers" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[["Element", String(geometry.element)], ["Palm", `${geometry.palm_shape} (${geometry.palm_length_to_width})`], ["Fingers", `${geometry.finger_length} (${geometry.middle_finger_to_palm})`],
                    ["Index vs ring", String(geometry.index_vs_ring).replace("_", " ")], ["Thumb", `${geometry.thumb} (${geometry.thumb_to_index})`]].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-ivory border border-border p-3"><p className="text-[11px] text-text-secondary">{label}</p><p className="text-sm font-semibold text-text capitalize">{value}</p></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CalculationGate description="See how the photo was processed, the exact measurement behind every line and mount, the rule each measurement triggered, and Cheiro's original wording for every claim used.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(result.method).map(([k, v]) => <div key={k} className="rounded-xl bg-ivory border border-border p-3"><p className="text-[11px] uppercase tracking-wide text-text-secondary font-semibold">{k.replace("_", " ")}</p><p className="text-sm text-text mt-0.5">{v}</p></div>)}
            </div>
            <div>
              <p className="font-semibold text-text mb-2">Measured → rule → claims</p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-ivory text-[11px] uppercase tracking-wider text-text-secondary"><tr>{["Finding", "Rule applied", "Measured", "Weight", "Knowledge records"].map((h) => <th key={h} className="text-left px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    {result.conditions.map((c, i) => (
                      <tr key={i} className="border-t border-border/70 align-top">
                        <td className="px-3 py-2 font-medium text-text">{c.label}</td>
                        <td className="px-3 py-2 text-xs text-text-secondary">{c.rule}</td>
                        <td className="px-3 py-2 text-xs font-mono text-navy">{c.measured}</td>
                        <td className="px-3 py-2 text-xs">{c.weight}</td>
                        <td className="px-3 py-2 text-[11px] font-mono text-text-secondary">{c.record_ids.length ? c.record_ids.join(", ") : "— no traditional claim recorded"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="font-semibold text-text mb-2">Line measurements</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.values(result.analysis.lines).map((l) => (
                  <div key={l.key} className="rounded-xl border border-border p-3 bg-card text-xs text-text-secondary space-y-0.5">
                    <p className="text-sm font-semibold text-text">{l.name}</p>
                    {l.length_palm_widths !== undefined ? <>
                      <p>Length {l.length_palm_widths} palm-widths · crease response {l.mean_crease_response} · coverage {l.coverage}</p>
                      <p>Sagitta/chord {l.sagitta_ratio} ({l.curvature}) · breaks {l.breaks} · fork {l.forked_end ? "yes" : "no"}</p>
                      <p>Start (u,v) {l.start_uv?.join(", ")} → end {l.end_uv?.join(", ")} · confidence {l.confidence}</p>
                    </> : <p>{l.reason}</p>}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-secondary mt-2">Coordinates use a palm-normalised frame: u runs from the index-finger base (0) to the little-finger base (1); v runs from the finger bases (0) to the wrist (1). Thresholds: {Object.entries(result.analysis.thresholds).map(([k, v]) => `${k} ${v}`).join(" · ")}.</p>
            </div>
            <div><p className="font-semibold text-text mb-2">Traditional claims used ({result.evidence.length})</p><EvidenceTable evidence={result.evidence} /></div>
          </CalculationGate>

          <Disclaimer text={result.disclaimer} />
        </section>
      )}
    </div>
  );
}
