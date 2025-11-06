import React, { useCallback, useRef, useState } from "react";

export function UploadArea({ onSelected }: { onSelected: (file: File, previewUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (!/^image\//.test(f.type)) return alert("Please choose an image file.");
    const url = URL.createObjectURL(f);
    onSelected(f, url);
  }, [onSelected]);

  return (
    <div
      className={[
        "group relative flex items-center justify-center",
        "border-2 border-dashed rounded-2xl p-8 transition",
        dragOver ? "bg-yellow-50 border-yellow-400" : "bg-white hover:bg-neutral-50",
      ].join(" ")}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label="Upload or drop an image"
    >
      <div className="text-center space-y-2">
        <div className="text-base font-medium">Drop a banana photo here</div>
        <div className="text-sm text-neutral-600">or click to browse</div>
      </div>
      <input ref={inputRef} className="hidden" type="file" accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
