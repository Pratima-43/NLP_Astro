"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Activity, Brain, Briefcase, Camera, Check, Heart, ImageUp, Palette, RotateCcw, ScanLine, UserRound, X,
} from "lucide-react";
import { HandChoice } from "@/components/forms/HandChoice";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import {
  GenerationNote, GoodToKnow, InShort, NextStepCard, PointList, PredictionList, SectionTitle, SourceItem, TopicCards,
} from "@/components/readings/Blocks";
import { PrintButton } from "@/components/readings/PrintButton";
import { ReadingHeader } from "@/components/readings/ReadingHeader";
import { WorkingPanel } from "@/components/readings/WorkingPanel";
import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";
import { apiFetch } from "@/lib/api";
import { useLatest } from "@/lib/hooks";
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_MB, shrinkPhoto } from "@/lib/image";
import { humanize, joinWords } from "@/lib/format";
import { step as stepOf } from "@/lib/journey";
import { HAND_SHAPES, LINE_WORDS, groupClaims, uniqueEvidence } from "@/lib/readings";
import type { PalmLine, PalmReading } from "@/types/readings";

const STEP = stepOf("hand");
const STAGES = [
  "Finding your hand in the photo",
  "Straightening the palm",
  "Tracing the main lines",
  "Measuring the lines, mounts and hand shape",
  "Finding what Cheiro’s book says",
  "Writing your reading in plain words",
];
const SECTION_ICONS = { personality: UserRound, relationships: Heart, career: Briefcase, education: Brain, creativity: Palette, health: Activity };
const DO = ["Palm facing the camera", "Fingers together, pointing up", "Good daylight, no dark shadows", "Your whole hand fills the photo"];
const DONT = ["Not the back of your hand", "Not blurry or too far away"];

export function HandView() {
  const user = useUser();
  const { isPremium } = useAuth();
  const [saved, setSaved] = useLatest<PalmReading>("/palmistry/latest");
  const [startNew, setStartNew] = useState(false);
  const [hand, setHand] = useState<"left" | "right">(user.dominantHand);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [marked, setMarked] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const reading = saved.status === "ready" ? saved.data : null;
  const showUpload = !working && saved.status === "ready" && (!reading || startNew);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    if (picked.type && !picked.type.startsWith("image/")) {
      setError("That file isn’t a photo. Please choose a photo of your palm.");
      return;
    }
    setError("");
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  function clearPhoto() {
    setFile(null);
    setPreview(null);
  }

  async function read() {
    if (!file) return;
    setError("");
    setWorking(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const upload = await shrinkPhoto(file);
      if (!ACCEPTED_PHOTO_TYPES.includes(upload.type)) throw new Error("Please use a JPEG, PNG or WebP photo.");
      if (upload.size > MAX_PHOTO_MB * 1024 * 1024) throw new Error(`The photo is too large. Please use one under ${MAX_PHOTO_MB} MB.`);
      const form = new FormData();
      form.append("image", upload);
      form.append("hand", hand);
      const fresh = await apiFetch<PalmReading>("/palmistry/analyze", { method: "POST", body: form });
      setMarked(fresh.annotated_image ?? null);
      setSaved(fresh);
      setStartNew(false);
      clearPhoto();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again in a moment.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <ReadingHeader step={STEP}>
        {reading && !working && !startNew && (
          <>
            <PrintButton />
            <Button variant="secondary" onClick={() => { setStartNew(true); setError(""); }} icon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}>
              Read another photo
            </Button>
          </>
        )}
      </ReadingHeader>

      {error && <Notice tone="error" title="We couldn’t read this photo">{error}</Notice>}

      {working && <WorkingPanel stages={STAGES} tone={STEP.tone} />}
      {!working && saved.status === "loading" && <p className="flex items-center gap-3 text-lg text-ink-2" role="status"><Spinner />Opening your reading…</p>}
      {!working && saved.status === "error" && <Notice tone="error" title="We couldn’t open your reading">{saved.message}</Notice>}

      {showUpload && (
        <section className="flex flex-col gap-14">
          <div className="flex flex-col gap-4">
            <p className="eyebrow text-hand">Step 01</p>
            <h2 className="border-b border-ink/80 pb-4 text-4xl sm:text-5xl">Which hand will you photograph?
            </h2>
            <p className="text-lg text-ink-2">Palm readers start with the hand you write with. It shows the life you have made.</p>
            <div className="max-w-md"><HandChoice value={hand} onChange={setHand} label="Hand in the photo" /></div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="eyebrow text-hand">Step 02</p>
            <h2 className="border-b border-ink/80 pb-4 text-4xl sm:text-5xl">Take a clear photo of your palm
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <ul className="flex flex-col gap-3 rounded-[1.5rem] bg-good-soft p-6">
                {DO.map((tip) => (
                  <li key={tip} className="flex items-center gap-2 text-lg text-[#14532d]"><Check className="h-5 w-5 shrink-0" aria-hidden="true" />{tip}</li>
                ))}
              </ul>
              <ul className="flex flex-col gap-3 rounded-[1.5rem] bg-bad-soft p-6">
                {DONT.map((tip) => (
                  <li key={tip} className="flex items-center gap-2 text-lg text-[#7f1d1d]"><X className="h-5 w-5 shrink-0" aria-hidden="true" />{tip}</li>
                ))}
                <li className="text-base text-[#7f1d1d]">Tip: ask someone to take it for you, or use the back camera.</li>
              </ul>
            </div>

            {preview ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the user's own photo */}
                <img src={preview} alt="The palm photo you chose" className="max-h-80 w-auto max-w-full rounded-2xl border border-line object-contain" />
                <Button variant="secondary" onClick={clearPhoto} icon={<X className="h-5 w-5" aria-hidden="true" />}>Choose a different photo</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" onClick={() => camera.current?.click()} icon={<Camera className="h-5 w-5" aria-hidden="true" />}>Take a photo</Button>
                <Button size="lg" variant="secondary" onClick={() => gallery.current?.click()} icon={<ImageUp className="h-5 w-5" aria-hidden="true" />}>Choose a photo</Button>
              </div>
            )}
            <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={choose} />
            <input ref={gallery} type="file" accept="image/*" className="hidden" onChange={choose} />
          </div>

          <div className="flex flex-col gap-4">
            <p className="eyebrow text-hand">Step 03</p>
            <h2 className="border-b border-ink/80 pb-4 text-4xl sm:text-5xl">Read my palm
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" onClick={read} disabled={!file} icon={<ScanLine className="h-5 w-5" aria-hidden="true" />}>Read my palm</Button>
              {reading && <Button size="lg" variant="quiet" onClick={() => { setStartNew(false); clearPhoto(); }}>Cancel</Button>}
            </div>
            <p className="text-base text-ink-2">{file ? "Your photo is ready." : "Choose a photo first."} We measure it and then delete it. We never keep your photo.</p>
          </div>
        </section>
      )}

      {!working && !showUpload && reading && <HandResult reading={reading} marked={marked} />}

      {reading && !working && !showUpload && <NextStepCard after="hand" isPremium={isPremium} />}
    </div>
  );
}

function lineWords(line: PalmLine): string {
  const bits = [
    line.depth && `${line.depth}`,
    line.curvature && `${line.curvature}`,
    line.breaks ? `${line.breaks} break${line.breaks > 1 ? "s" : ""}` : "no breaks",
    line.forked_end ? "splits at the end" : null,
  ].filter(Boolean) as string[];
  return joinWords(bits);
}

function HandResult({ reading, marked }: { reading: PalmReading; marked: string | null }) {
  const { analysis, interpretation } = reading;
  const element = String(analysis.geometry.element);
  const lines = ["heart", "head", "life", "fate", "sun"].map((k) => analysis.lines[k]).filter(Boolean);
  const found = lines.filter((l) => l.detected);
  const written = interpretation.generation_status === "generated";
  const groups = groupClaims(uniqueEvidence(reading.evidence));
  const evidence = uniqueEvidence(reading.evidence);

  const headline = interpretation.headline || `A ${element} hand`;
  const overview = interpretation.overview
    || `You have ${element === "air" || element === "earth" ? "an" : "a"} ${element} hand: ${HAND_SHAPES[element] ?? "a balanced shape"}. In your photo we found your ${joinWords(found.map((l) => (LINE_WORDS[l.key]?.name ?? l.name).toLowerCase()))}.`;

  return (
    <div className="flex flex-col gap-10">
      {analysis.warnings.map((w) => <Notice key={w} tone="warning">{w}</Notice>)}
      {reading.reused && <Notice tone="info">This is the same photo as last time, so you’re seeing the same reading.</Notice>}
      <GenerationNote status={interpretation.generation_status} />

      <InShort headline={headline} text={overview} tone="hand" />

      <section aria-labelledby="lines-title" className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-3">
          {marked ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- the marked-up photo returned by the reading */}
              <img src={marked} alt={`Your ${reading.hand} palm with the lines we found drawn on it`} className="w-full rounded-[2rem] bg-night object-contain" />
              <p className="text-base text-ink-2">Coloured lines are the ones we found. Grey lines were too faint to count. Circles show the mounts.</p>
            </>
          ) : (
            <Notice tone="info" title="We don’t keep your photo">
              The photo with your lines drawn on it appears only right after a reading. Your measurements are saved below.
            </Notice>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <SectionTitle id="lines-title" title="Your lines" subtitle={`Your ${reading.hand} hand · ${humanize(element)} hand (${HAND_SHAPES[element] ?? ""})`} />
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.key} className="flex items-start gap-4 border-b border-line py-5">
                <span className="mt-1.5 h-4 w-4 shrink-0 rounded-full" style={{ background: line.detected ? line.color : "#cfc8bd" }} aria-hidden="true" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-2xl">{LINE_WORDS[line.key]?.name ?? line.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-base font-semibold ${line.detected ? "bg-good-soft text-[#14532d]" : "bg-paper text-ink-2"}`}>
                      {line.detected ? "Found" : "Not clear in this photo"}
                    </span>
                  </div>
                  <span className="text-base text-ink-2">{LINE_WORDS[line.key]?.about}</span>
                  {line.detected && <span className="text-base">{lineWords(line)}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {written && (interpretation.predictions?.length ?? 0) > 0 && (
        <section aria-labelledby="hand-ahead" className="flex flex-col gap-5">
          <SectionTitle id="hand-ahead" title="What your hand suggests" subtitle="Traditional tendencies, with how sure each one is." />
          <PredictionList predictions={interpretation.predictions ?? []} tone="hand" />
        </section>
      )}

      {written && (interpretation.sections?.length ?? 0) > 0 && (
        <section aria-labelledby="hand-topics" className="flex flex-col gap-5">
          <SectionTitle id="hand-topics" title="Your reading, topic by topic" />
          <TopicCards sections={interpretation.sections ?? []} icons={SECTION_ICONS} tone="hand" />
        </section>
      )}

      {!written && (
        <section aria-labelledby="hand-books" className="flex flex-col gap-5">
          <SectionTitle id="hand-books" title="What Cheiro’s book says about your hand" />
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
            <PointList title="Lean into" kind="good" items={groups.good} />
            <PointList title="Go easy on" kind="care" items={groups.care} />
            <PointList title="Also in your hand" kind="other" items={groups.other} />
          </div>
        </section>
      )}

      <Disclosure title="How we worked this out" subtitle="Each measurement, the rule it matched, and the book quote it led to">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">What we measured</h3>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[34rem] text-left text-base">
                <thead className="bg-paper text-ink-2">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">What we found</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Rule</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Measured</th>
                  </tr>
                </thead>
                <tbody>
                  {reading.conditions.map((c, i) => (
                    <tr key={i} className="border-t border-line align-top">
                      <th scope="row" className="px-4 py-3 font-semibold">{c.label}</th>
                      <td className="px-4 py-3 text-ink-2">{c.rule}</td>
                      <td className="px-4 py-3 tabular-nums">{c.measured}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">The mounts (fleshy pads of the palm)</h3>
            <p className="text-base text-ink-2">Mounts are hard to judge from a flat photo, so they count for the least.</p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(analysis.mounts).map(([key, m]) => (
                <li key={key} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-4 py-2.5 text-base">
                  <span>{m.name.replace("Mount of the ", "").replace("Mount of ", "")}</span>
                  <span className="font-semibold">{m.development === "not_visible" ? "not visible" : m.development}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">How the photo was read</h3>
            <ul className="flex flex-col gap-2">
              {Object.entries(reading.method).map(([k, v]) => (
                <li key={k} className="rounded-xl bg-paper px-4 py-3 text-base"><span className="font-semibold">{humanize(k)}: </span>{v}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">Quotes from the book ({evidence.length})</h3>
            <ul className="flex flex-col gap-2">
              {evidence.map((e) => <SourceItem key={e.claim} claim={e.claim} source={e.source_name} reasons={e.reasons} />)}
            </ul>
          </div>
        </div>
      </Disclosure>

      <GoodToKnow text={reading.disclaimer} />
    </div>
  );
}
