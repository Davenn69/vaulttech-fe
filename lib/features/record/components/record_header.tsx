"use client";

import { FileText, RefreshCw, History } from "lucide-react";

type RecordHeaderProps = {
  title: string;
  subtitle: string;
  revisionCount: number;
  onReload: () => void;
};

export default function RecordHeader({
  title,
  subtitle,
  revisionCount,
  onReload,
}: RecordHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222426] px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
          Record viewer
        </p>
        <div className="mt-2 flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d] text-[#6c5ce7]">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-[#f5f6f7]">
              {title}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-[#7a7d82]">
              <History size={14} />
              <span>{revisionCount} revisions</span>
              <span className="text-[#4a4d52]">•</span>
              <span className="truncate">{subtitle}</span>
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReload}
        className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729]"
      >
        <RefreshCw size={15} />
        Reload
      </button>
    </div>
  );
}
