import type { RawPrediction, Prediction } from "./types";

/**
 * Base URL for your FastAPI backend.
 * Example .env:  VITE_API_URL=https://api.bananadeath.online
 */
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

/** Convert any 0..1 or 0..100 signal to 0..1 */
function to01(p?: number, pPercent?: number): number | null {
  if (typeof p === "number") return p > 1 ? p / 100 : p;
  if (typeof pPercent === "number") return pPercent / 100;
  return null;
}

/** Pick a nice display label regardless of field name */
function chooseLabel(r: RawPrediction): string {
  return (
    r.label_pretty ??
    r.predicted_class_name ??
    r.label ??
    "—"
  );
}

/** Normalize server JSON into the clean Prediction shape */
function normalize(r: RawPrediction): Prediction {
  return {
    label: chooseLabel(r),
    confidence01: to01(r.confidence, r.confidence_percent),
    timingsMs: r.timings_ms?.total ?? null,
    probs: r.probs,
  };
}

/**
 * Send an image to /predict and return a normalized Prediction.
 */
export async function predict(file: File): Promise<Prediction> {
  if (!API_BASE) {
    throw new Error("VITE_API_URL is not set. Check your .env file.");
  }

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Prediction failed (${res.status}) ${msg || res.statusText}`);
  }

  const raw = (await res.json()) as RawPrediction;
  return normalize(raw);
}

/** Optional helper for the UI */
export function formatPercent01(x: number | null): string {
  return x == null ? "–" : `${(x * 100).toFixed(1)}%`;
}