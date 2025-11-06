// src/components/ImagePicker.tsx
import React, { useRef, useState, useCallback } from "react";

type Props = {
  onSelected: (file: File, previewUrl: string) => void;
  accept?: string;            // default: "image/*"
  allowCapture?: boolean;     // mobile camera hint
  label?: string;             // button label
};

export function ImagePicker({
  onSelected,
  accept = "image/*",
  allowCapture = true,
  label = "Choose image",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (!/^image\//.test(f.type)) {
      alert("Please select an image file.");
      return;
    }
    const url = URL.createObjectURL(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    onSelected(f, url);
  }, [onSelected]);

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    // You can also notify parent you cleared selection if needed
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-xl px-4 py-2 border bg-white hover:bg-neutral-50 active:scale-[.98]"
          >
            {label}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={clearImage}
              className="rounded-xl px-3 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 active:scale-[.98] text-sm"
              aria-label="Clear selected image"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          // `capture="environment"` is a hint for mobile browsers to open the rear camera.
          // It’s ignored on desktop. Only add when allowCapture is true.
          {...(allowCapture ? { capture: "environment" as any } : {})}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mt-4 overflow-hidden rounded-xl border bg-neutral-50 grid place-items-center min-h-40">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected preview"
              className="w-full h-auto object-contain"
            />
          ) : (
            <span className="text-neutral-500 text-sm py-8">No image selected</span>
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Tip: Good lighting and a single banana gives best results.
      </p>
    </div>
  );
}
