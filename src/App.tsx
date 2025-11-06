// src/App.tsx
import React, { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { CameraCapture } from "./components/CameraCapture";
import { UploadArea } from "./components/UploadArea";
import { ImagePicker } from "./components/ImagePicker";
import { PredictionCard } from "./components/PredictionCard";
import { predict, formatPercent01 } from "./lib/api";
import type { Prediction } from "./lib/types";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Used to force-remount child pickers so selecting the SAME file fires onChange again
  const [resetKey, setResetKey] = useState(0);

  const [history, setHistory] = useState<Array<{ img: string; result: Prediction }>>([]);

  const canPredict = useMemo(() => !!file && !loading, [file, loading]);

  async function onPredict() {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    setPrediction(null);
    try {
      const res = await predict(file); // returns normalized shape
      setPrediction(res);
      setHistory((prev) => [{ img: previewUrl, result: res }, ...prev].slice(0, 6));
    } catch (e: any) {
      setError(e?.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  function onSelected(f: File, url: string) {
    // Revoke any prior URL to avoid leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(url);
    setPrediction(null);
    setError("");
  }

  function onReset() {
    // Revoke preview URL, clear everything, and force child inputs to remount
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setPrediction(null);
    setError("");
    setLoading(false);
    setResetKey((k) => k + 1); // causes ImagePicker/CameraCapture to remount
  }

  return (
    <div className="min-h-screen bg-yellow-100/40 text-neutral-900">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Banana Death Classifier
          </h2>
          <h4 className="text-neutral-700 max-w-2xl mx-auto">
            Upload or capture a photo and our model will predict ripeness in a snap.
          </h4>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Note: No data is stored; images are processed in-flight only.
          </p>
        </section>

        {/* Upload + Camera Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold">Camera</h3>
            {/* Remount on reset to ensure a clean capture state */}
            <CameraCapture key={`cam-${resetKey}`} onCapture={onSelected} />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Upload</h3>
            {/* Use ImagePicker; remount on reset so selecting the same file fires onChange */}
            <ImagePicker key={`picker-${resetKey}`} onSelected={onSelected} />
            {/* <UploadArea key={`drop-${resetKey}`} onSelected={onSelected} /> */}
            <p className="mt-2 text-xs text-neutral-500">
              Tips: good lighting, single banana, no heavy glare.
            </p>
          </div>
        </section>

        {/* Prediction + Results Section */}
        <section className="space-y-6">
          <div className="flex gap-3 justify-center lg:justify-start">
            <button
              onClick={onPredict}
              disabled={!canPredict}
              className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                canPredict
                  ? "bg-banana text-neutral-900 hover:bg-bananaDark shadow-sm hover:shadow-md active:scale-[.98]"
                  : "opacity-50 cursor-not-allowed bg-neutral-200 text-neutral-500"
              }`}
            >
              {loading ? "Predicting…" : "Predict Ripeness"}
            </button>

            <button
              onClick={onReset}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-[.98]"
            >
              Reset
            </button>
          </div>

          {previewUrl && (
            <PredictionCard imgUrl={previewUrl} prediction={prediction} onReset={onReset} />
          )}

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}
        </section>

        {/* History Section */}
        {history.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-3">Recent</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {history.map((h, i) => (
                <figure key={i} className="rounded-xl border bg-white overflow-hidden">
                  <img src={h.img} className="w-full h-24 object-cover" />
                  <figcaption className="p-2 text-xs">
                    <div className="font-medium truncate">{h.result.label}</div>
                    <div className="text-neutral-600">
                      {formatPercent01(h.result.confidence01)}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Info Section */}
        <section id="how" className="prose prose-neutral max-w-none">
          <h3>How it works</h3>
          <p>
            We run a custom CNN model trained on a personal dataset, behind a FastAPI endpoint. The browser sends a single image
            via a multipart POST to <code>/predict</code> and receives JSON with a label,
            confidence, and latency.
          </p>
        </section>

        <section id="privacy" className="prose prose-neutral max-w-none">
          <h3>Privacy</h3>
          <p>
            Important: Images are never stored server-side. They are processed in-memory solely for
            inference and then discarded.
          </p>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-600 flex flex-col md:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Banana Death</span>
          <a className="hover:underline" href="mailto:contact@bananadeath.online">
            contact@bananadeath.online
          </a>
        </div>
      </footer>
    </div>
  );
}
