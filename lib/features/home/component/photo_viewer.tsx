"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type PhotoViewerProps = {
  open: boolean;
  title: string;
  src: string;
  onClose: () => void;
};

export function PhotoViewer({ open, title, src, onClose }: PhotoViewerProps) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101113] shadow-[0_28px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Close viewer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative flex min-h-[60vh] items-center justify-center bg-[#0b0c0d] p-3 sm:min-h-[72vh] sm:p-5">
          {/* Viewer renders backend/image URLs directly, so a plain img tag is appropriate here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
          />
        </div>
      </div>
    </div>
  );
}

export default PhotoViewer;
