import React from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-yellow-50/70 bg-yellow-50/90 border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 rounded-xl bg-yellow-300 border border-yellow-400" />
          <h1 className="text-lg font-semibold tracking-tight">Banana Death</h1>
        </div>
        <nav className="text-sm text-neutral-700 flex items-center gap-4">
          <a className="hover:underline" href="#how">How it works</a>
          <a className="hover:underline" href="#privacy">Privacy</a>
          <a className="hover:underline" href="https://github.com/cbass856-stack?tab=repositories" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
