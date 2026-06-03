"use client";

import {
  CalendarClock,
  Hash,
  Layers3,
  FileClock,
  RotateCcw,
} from "lucide-react";
import { RevisionEntry } from "../types/record";

type RevisionTimelineProps = {
  revisions: RevisionEntry[];
  selectedRevisionId?: string;
  onSelectRevision?: (revision: RevisionEntry) => void;
  onRevertRevision?: (revision: RevisionEntry) => void;
  revertingRevisionId?: string;
};

function formatDate(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatSize(size?: number) {
  if (size == null || Number.isNaN(size)) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  return `${currentSize.toFixed(currentSize >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function RevisionTimeline({
  revisions,
  selectedRevisionId,
  onSelectRevision,
  onRevertRevision,
  revertingRevisionId,
}: RevisionTimelineProps) {
  if (!revisions.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#2a2c2e] bg-[#121315] px-6 py-14 text-center">
        <FileClock className="mx-auto text-[#7a7d82]" size={34} />
        <h2 className="mt-4 text-lg font-semibold text-[#f5f6f7]">
          No revisions yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7a7d82]">
          When the backend starts returning revision history, it will appear
          here as a chronological timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {revisions.map((revision) => (
        <article
          key={revision.id}
          role={onSelectRevision ? "button" : undefined}
          tabIndex={onSelectRevision ? 0 : undefined}
          onClick={() => onSelectRevision?.(revision)}
          onKeyDown={(event) => {
            if (!onSelectRevision) return;

            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectRevision(revision);
            }
          }}
          className="rounded-3xl border border-[#222426] bg-[#121315] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
          data-selected={selectedRevisionId === revision.id}
          style={{
            cursor: onSelectRevision ? "pointer" : "default",
            borderColor:
              selectedRevisionId === revision.id ? "#6c5ce7" : undefined,
            boxShadow:
              selectedRevisionId === revision.id
                ? "0 0 0 1px rgba(108,92,231,0.35), 0 12px 30px rgba(0,0,0,0.18)"
                : undefined,
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8e9ea]">
                  <Hash size={10} />
                  {revision.versionNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right text-xs text-[#7a7d82]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
                <CalendarClock size={12} />
                {formatDate(revision.createdAt)}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
                <Layers3 size={12} />
                {formatSize(revision.size)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#222426] pt-4 text-xs text-[#7a7d82]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
              <CalendarClock size={12} />
              Saved at {formatDate(revision.createdAt)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
              <Layers3 size={12} />
              {formatSize(revision.size)}
            </span>
          </div>

          {onRevertRevision ? (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#222426] pt-4">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRevertRevision(revision);
                }}
                disabled={revertingRevisionId === revision.id}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw size={15} />
                {revertingRevisionId === revision.id
                  ? "Reverting..."
                  : "Revert to this revision"}
              </button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
