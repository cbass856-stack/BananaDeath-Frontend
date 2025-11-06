import React from "react";
import type { Prediction } from "../lib/api";
import { formatPercent01 } from "../lib/api";

// Normalize confidence to 0..1 whether backend sends 0.9953 or 99.53 or confidence_percent
const to01 = (p?: number, pPercent?: number) => {
  if (typeof p === "number") return p > 1 ? p / 100 : p;
  if (typeof pPercent === "number") return pPercent / 100;
  return undefined;
};

const pct = (x?: number) =>
  typeof x === "number" ? `${(x * 100).toFixed(1)}%` : "–";

export function PredictionCard({
  imgUrl,
  prediction,
  onReset,
}: {
  imgUrl: string;
  prediction: Prediction | null;
  onReset: () => void;
}) {
  // Pick the best available label field
  const label =
    prediction?.label_pretty ??
    (prediction as any)?.predicted_class_name ?? // legacy / Python field
    prediction?.label ??
    "—";

  // Normalize confidence
  const conf01 = to01(
    prediction?.confidence as any,
    (prediction as any)?.confidence_percent
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="overflow-hidden rounded-2xl border bg-white">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt="Uploaded banana preview"
            className="w-full h-auto object-contain"
          />
        ) : (
          <div className="aspect-video grid place-items-center text-neutral-500">
            No image
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="text-lg font-semibold">Prediction</h3>

          {prediction ? (
            <div className="mt-3 space-y-2">
              <div className="text-2xl font-bold tracking-tight">
                {label}
              </div>

              <div className="text-sm text-neutral-600">
                Confidence: {formatPercent01(prediction?.confidence01 ?? null)}
              </div>
              {prediction?.timingsMs != null && (
                <div className="text-sm text-neutral-600">
                  Latency: {prediction.timingsMs} ms
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 text-neutral-600">No result yet.</div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 border bg-white hover:bg-neutral-50 active:scale-[.99]"
          >
            Try another photo
          </button>
        </div>
      </div>
    </div>
  );
}
