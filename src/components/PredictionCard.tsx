// src/components/PredictionCard.tsx
import React from "react";
import type { Prediction } from "../lib/types";
import { formatPercent01 } from "../lib/api";

export function PredictionCard({
  imgUrl,
  prediction,
  onReset,
}: {
  imgUrl: string;
  prediction: Prediction | null;
  onReset: () => void;
}) {
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
              {/* normalized label */}
              <div className="text-2xl font-bold tracking-tight">
                {prediction.label}
              </div>

              {/* normalized confidence */}
              <div className="text-sm text-neutral-600">
                Confidence: {formatPercent01(prediction.confidence01)}
              </div>

              {/* normalized timings */}
              {prediction.timingsMs != null && (
                <div className="text-sm text-neutral-600">
                  Latency: {prediction.timingsMs} ms
                </div>
              )}

              {/* optional: show distribution if present */}
              {prediction.probs && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-neutral-700">Details</summary>
                  <ul className="mt-1 grid grid-cols-2 gap-x-4">
                    {Object.entries(prediction.probs).map(([k, v]) => (
                      <li key={k} className="flex justify-between">
                        <span className="capitalize">{k}</span>
                        <span>{(v * 100).toFixed(1)}%</span>
                      </li>
                    ))}
                  </ul>
                </details>
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
