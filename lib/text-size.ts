// Reader text size, kept in this browser. Applied to <html data-text-size> so every rem scales.

export type TextSize = "normal" | "large" | "xlarge";

export const TEXT_SIZES: Array<{ value: TextSize; label: string; sample: string }> = [
  { value: "normal", label: "Normal", sample: "text-2xl" },
  { value: "large", label: "Large", sample: "text-3xl" },
  { value: "xlarge", label: "Extra large", sample: "text-4xl" },
];

const STORAGE_KEY = "av-text-size";
const CHANGE_EVENT = "av:text-size";

/** Runs in <head> before the first paint, so a saved size never flashes back to normal. */
export const TEXT_SIZE_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");if(s==="large"||s==="xlarge")document.documentElement.setAttribute("data-text-size",s)}catch(e){}})()`;

export function readTextSize(): TextSize {
  const value = document.documentElement.getAttribute("data-text-size");
  return value === "large" || value === "xlarge" ? value : "normal";
}

export function writeTextSize(size: TextSize): void {
  const root = document.documentElement;
  if (size === "normal") root.removeAttribute("data-text-size");
  else root.setAttribute("data-text-size", size);
  try {
    localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // Private mode: the size still applies until the tab closes.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeTextSize(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}
