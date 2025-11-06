import React, { useCallback, useEffect, useRef, useState } from "react";

export function CameraCapture({
  onCapture,
}: {
  onCapture: (file: File, previewUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  const stop = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActive(false);
    // console.log("[cam] stop()");
  }, []);

  useEffect(() => {
    // cleanup ONLY on unmount
    return () => {
      stop();
    };
  }, [stop]);

  const attachStream = useCallback(async (s: MediaStream) => {
    const v = videoRef.current;
    if (!v) return;
    v.srcObject = s;
    v.onloadedmetadata = async () => {
      try {
        await v.play();
      } catch (e) {
        console.warn("video.play() failed:", e);
      }
    };
  }, []);

  const start = useCallback(async () => {
    setError("");

    // Guard: if we already have a stream, don’t start again
    if (streamRef.current) {
      setActive(true);
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = s;
      setActive(true);
      await attachStream(s);
    } catch (e1: any) {
      try {
        const s2 = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = s2;
        setActive(true);
        await attachStream(s2);
      } catch (e2: any) {
        setError(e2?.message || e1?.message || "Camera access failed");
        setActive(false);
      }
    }
  }, [attachStream]);

  async function capture() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    // Wait a tick if metadata is tiny (2x2) or not ready yet
    if (!v.videoWidth || !v.videoHeight || (v.videoWidth <= 2 && v.videoHeight <= 2)) {
      await new Promise((r) => setTimeout(r, 50));
    }

    const w = v.videoWidth || 640;
    const h = v.videoHeight || 480;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/jpeg", 0.92));
    if (!blob) return;

    const file = new File([blob], `banana_${Date.now()}.jpg`, { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    onCapture(file, url);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-dashed bg-yellow-50/60 p-2">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 grid place-items-center">
          {/* muted is critical for autoplay */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-contain ${active ? "block" : "hidden"}`}
          />
          {!active && <div className="text-neutral-600 text-sm">Camera View</div>}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {!active ? (
          <button onClick={start} className="rounded-xl px-4 py-2 border bg-white hover:bg-neutral-50">
            Enable Camera
          </button>
        ) : (
          <>
            <button
              onClick={capture}
              className="rounded-xl px-4 py-2 border bg-yellow-300 border-yellow-400 hover:bg-yellow-200"
            >
              Capture
            </button>
            <button onClick={stop} className="rounded-xl px-4 py-2 border bg-white hover:bg-neutral-50">
              Disable
            </button>
          </>
        )}
      </div>
    </div>
  );
}
