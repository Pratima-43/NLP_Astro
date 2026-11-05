"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getLatest } from "@/lib/api";
import { readTextSize, subscribeTextSize, writeTextSize, type TextSize } from "@/lib/text-size";

const noSubscription = () => () => {};

/** False on the server and during hydration, true in the browser afterwards. */
export function useIsBrowser(): boolean {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}

export function useTextSize(): [TextSize, (size: TextSize) => void] {
  const size = useSyncExternalStore(subscribeTextSize, readTextSize, () => "normal" as TextSize);
  return [size, writeTextSize];
}

export type Loadable<T> =
  | { status: "loading" }
  | { status: "ready"; data: T | null }
  | { status: "error"; message: string };

/** Load the latest saved reading for this user (null when there is none yet). */
export function useLatest<T>(path: string | null): [Loadable<T>, (data: T | null) => void] {
  const [state, setState] = useState<Loadable<T>>({ status: "loading" });
  useEffect(() => {
    if (!path) return;
    let alive = true;
    getLatest<T>(path)
      .then((data) => {
        if (alive) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (alive) setState({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." });
      });
    return () => {
      alive = false;
    };
  }, [path]);
  const set = useCallback((data: T | null) => setState({ status: "ready", data }), []);
  return [state, set];
}

/** Seconds since `running` became true; resets when it stops. */
export function useElapsedSeconds(running: boolean): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => {
      window.clearInterval(id);
      setSeconds(0);
    };
  }, [running]);
  return seconds;
}

function chunkForSpeech(text: string): string[] {
  // Browsers cut off very long utterances, so speak sentence by sentence.
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > 220 && current) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Read text aloud with the browser's built-in voice (no data leaves the device). */
export function useSpeech() {
  const supported = useSyncExternalStore(
    noSubscription,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );
  const [speaking, setSpeaking] = useState(false);
  const run = useRef(0);

  const stop = useCallback(() => {
    run.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const token = ++run.current;
    const voices = synth.getVoices();
    const voice = voices.find((v) => v.lang === "en-IN") ?? voices.find((v) => v.lang.startsWith("en"));
    const chunks = chunkForSpeech(text);
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          if (run.current === token) setSpeaking(false);
        };
      }
      utterance.onerror = () => {
        if (run.current === token) setSpeaking(false);
      };
      synth.speak(utterance);
    });
    setSpeaking(true);
  }, []);

  useEffect(() => {
    if (!supported) return;
    return () => window.speechSynthesis.cancel();
  }, [supported]);

  return { supported, speaking, speak, stop };
}
