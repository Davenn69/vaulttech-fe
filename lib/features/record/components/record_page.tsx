"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { AlertTriangle, FolderClock, History, Layers3 } from "lucide-react";
import useRecord from "../hooks/useRecord";
import RecordHeader from "./record_header";
import RevisionTimeline from "./revision_timeline";

type RecordPageProps = {
  id: string;
};

function formatDate(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatSize(size: number) {
  if (Number.isNaN(size)) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  return `${currentSize.toFixed(currentSize >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function RecordPage({ id }: RecordPageProps) {
  const { loading, record, error, fetchRecord } = useRecord(id);
  const latestRevision = record?.revisions?.[0];

  return (
    <PageWrapper isLoading={loading} className="min-h-dvh">
      <main className="flex min-h-dvh flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <RecordHeader
            title={record?.file.name ?? "Record"}
            subtitle={record?.file.extension ?? "Revision history"}
            revisionCount={record?.revisions?.length ?? 0}
            onReload={() => void fetchRecord(id)}
          />

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5">
              {error ? (
                <div className="rounded-3xl border border-[#3f2020] bg-[rgba(255,107,107,0.06)] px-6 py-5 text-[#ffb4b4]">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <h2 className="text-sm font-semibold">
                        Unable to load record
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-[#ffcccc]">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-[#222426] bg-[#121315] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
                        File summary
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-[#f5f6f7]">
                        {record?.file.name ?? "Waiting for file data"}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c3c3c3]">
                        This page tracks revision history for the selected file
                        and keeps the timeline focused on one document.
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d] text-[#6c5ce7]">
                      <History size={18} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                      label="Extension"
                      value={record?.file.extension ?? "-"}
                    />
                    <SummaryCard
                      label="Size"
                      value={
                        record?.file.size != null
                          ? formatSize(record.file.size)
                          : "-"
                      }
                    />
                    {/* <SummaryCard
                      label="Created"
                      value={
                        record?.file.createdAt
                          ? formatDate(record.file.createdAt)
                          : "-"
                      }
                    />
                    <SummaryCard
                      label="Updated"
                      value={
                        record?.file.updatedAt
                          ? formatDate(record.file.updatedAt)
                          : "-"
                      }
                    /> */}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#222426] bg-[#121315] p-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
                    Latest revision
                  </p>
                  {latestRevision ? (
                    <div className="mt-3 space-y-3">
                      {/* <h3 className="text-lg font-semibold text-[#f5f6f7]">
                        v{latestRevision.version} - {latestRevision.title}
                      </h3>
                      <p className="text-sm leading-6 text-[#c3c3c3]">
                        {latestRevision.summary}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-[#7a7d82]">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
                          <FolderClock size={12} />
                          {formatDate(latestRevision.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
                          <Layers3 size={12} />
                          {latestRevision.createdBy || "Unknown author"}
                        </span>
                      </div> */}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[#7a7d82]">
                      No revision data has been loaded yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
                    Revision timeline
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#f5f6f7]">
                    Recent changes
                  </h2>
                </div>
                <p className="text-sm text-[#7a7d82]">
                  {record?.revisions?.length ?? 0} entries
                </p>
              </div>

              <RevisionTimeline revisions={record?.revisions ?? []} />
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#222426] bg-[#1a1b1d] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[#e8e9ea]">{value}</p>
    </div>
  );
}
