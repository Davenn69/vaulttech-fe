"use client";

import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import type { RefObject } from "react";

type PdfViewerHeaderProps = {
  activeDocumentName: string;
  documentName: string;
  isEditingName: boolean;
  renaming: boolean;
  downloadUrl?: string;
  pdfUrl?: string;
  onBeginRename: () => void;
  onCancelRename: () => void;
  onDocumentNameChange: (value: string) => void;
  onReload: () => void;
  onSubmitRename: () => void;
  onBack: () => void;
  nameInputRef: RefObject<HTMLInputElement | null>;
};

export default function PdfViewerHeader({
  activeDocumentName,
  documentName,
  isEditingName,
  renaming,
  downloadUrl,
  pdfUrl,
  onBeginRename,
  onCancelRename,
  onDocumentNameChange,
  onReload,
  onSubmitRename,
  onBack,
  nameInputRef,
}: PdfViewerHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222426] px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1.5 text-xs font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729]"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
            PDF viewer
          </p>
        </div>
        {isEditingName ? (
          <input
            ref={nameInputRef}
            value={documentName}
            onChange={(event) => onDocumentNameChange(event.target.value)}
            onBlur={onSubmitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmitRename();
                return;
              }

              if (event.key === "Escape") {
                event.preventDefault();
                onCancelRename();
              }
            }}
            disabled={renaming}
            className="mt-2 w-full bg-transparent text-2xl font-semibold text-[#f5f6f7] outline-none placeholder:text-[#7a7d82] disabled:opacity-60"
            placeholder="Nama file"
          />
        ) : (
          <button
            type="button"
            onClick={onBeginRename}
            className="mt-2 block w-full min-w-0 text-left"
            title="Klik untuk ubah nama file"
          >
            <h1 className="truncate text-2xl font-semibold text-[#f5f6f7] transition-colors hover:text-white">
              {activeDocumentName}
            </h1>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onReload}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729]"
        >
          <RefreshCw size={15} />
          Reload
        </button>
        <a
          href={pdfUrl || downloadUrl || "#"}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!pdfUrl && !downloadUrl}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <ExternalLink size={15} />
          Open in new tab
        </a>
      </div>
    </div>
  );
}
