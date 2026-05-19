"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Grid3x3,
  Presentation,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { useMemo, type ReactNode } from "react";
import { useReviewDocument } from "../hooks/useReviewDocument";
import useWord from "@/lib/features/word/hooks/useWord";
import usePdf from "@/lib/features/pdf/hooks/usePdf";
import { useExcel } from "@/lib/features/excel/hooks/useExcel";
import usePowerpoint from "@/lib/features/powerpoint/hooks/usePowerpoint";
import RevisionTimeline from "@/lib/features/record/components/revision_timeline";

type ReviewDocumentPageProps = {
  id: string;
};

function normalizeExtension(extension?: string) {
  return (extension ?? "").replace(/^\./, "").toLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatSize(size?: number) {
  if (size == null || !Number.isFinite(size)) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  return `${currentSize.toFixed(currentSize >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function collectText(node: JSONContent | null | undefined): string[] {
  if (!node) return [];

  if (node.type === "text") {
    return [node.text ?? ""];
  }

  const children = Array.isArray(node.content) ? node.content : [];
  const childText = children.flatMap((child) => collectText(child));

  switch (node.type) {
    case "paragraph":
    case "heading":
    case "blockquote":
      return [childText.join("")];
    case "bulletList":
      return childText.map((line) => `• ${line}`);
    case "orderedList":
      return childText.map((line, index) => `${index + 1}. ${line}`);
    case "listItem":
    case "doc":
      return childText;
    default:
      return childText;
  }
}

function WordPreview({ id }: { id: string }) {
  const { loading, content, fileName } = useWord(id);
  const lines = useMemo(() => collectText(content), [content]);
  const previewText = lines.filter(Boolean).join("\n\n").trim();

  return (
    <PreviewFrame
      title="Word preview"
      subtitle={fileName ?? "Word document"}
      loading={loading}
      icon={<FileText size={18} />}
    >
      <div className="rounded-2xl border border-[#2a2c2e] bg-[#0f1011] p-4">
        <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-[#e8e9ea]">
          {previewText || "No text content was returned by the backend."}
        </pre>
      </div>
    </PreviewFrame>
  );
}

function ExcelPreview({ id }: { id: string }) {
  const { loading, content, fileName } = useExcel(id);
  const rows = content?.data ?? [];
  const visibleRows = rows.slice(0, 20);
  const visibleColumns = Math.max(...visibleRows.map((row) => row.length), 0);

  return (
    <PreviewFrame
      title="Spreadsheet preview"
      subtitle={fileName ?? "Excel workbook"}
      loading={loading}
      icon={<Grid3x3 size={18} />}
    >
      <div className="overflow-hidden rounded-2xl border border-[#2a2c2e] bg-[#0f1011]">
        <div className="max-h-[560px] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-[#7a7d82]">
                    No spreadsheet data returned by the backend.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: visibleColumns }, (_, colIndex) => (
                      <td
                        key={colIndex}
                        className="min-w-24 border-b border-r border-[#222426] px-3 py-2 align-top text-[#e8e9ea]"
                      >
                        {row[colIndex] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PreviewFrame>
  );
}

function PdfPreview({ id }: { id: string }) {
  const { loading, pdfUrl, fileName, fetchPdf } = usePdf(id);

  return (
    <PreviewFrame
      title="PDF preview"
      subtitle={fileName ?? "PDF document"}
      loading={loading}
      icon={<FileText size={18} />}
      action={
        <button
          type="button"
          onClick={() => void fetchPdf(id)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
        >
          <RefreshCw size={15} />
          Reload
        </button>
      }
    >
      <div className="min-h-[640px] overflow-hidden rounded-2xl border border-[#2a2c2e] bg-[#0b0f14]">
        {pdfUrl ? (
          <iframe title={fileName || "PDF document"} src={pdfUrl} className="h-[640px] w-full bg-white" />
        ) : (
          <div className="flex h-[640px] items-center justify-center p-6 text-center text-sm text-[#7a7d82]">
            PDF preview belum tersedia.
          </div>
        )}
      </div>
    </PreviewFrame>
  );
}

function PowerpointPreview({ id }: { id: string }) {
  const { loading, fileName, viewerUrl, fetchPowerpoint } = usePowerpoint(id);

  return (
    <PreviewFrame
      title="Presentation preview"
      subtitle={fileName ?? "PowerPoint presentation"}
      loading={loading}
      icon={<Presentation size={18} />}
      action={
        <button
          type="button"
          onClick={() => void fetchPowerpoint(id)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
        >
          <RefreshCw size={15} />
          Reload
        </button>
      }
    >
      <div className="min-h-[640px] overflow-hidden rounded-2xl border border-[#2a2c2e] bg-[#0b0f14]">
        {viewerUrl ? (
          <iframe title={fileName || "PowerPoint presentation"} src={viewerUrl} className="h-[640px] w-full bg-white" />
        ) : (
          <div className="flex h-[640px] items-center justify-center p-6 text-center text-sm text-[#7a7d82]">
            PowerPoint preview belum tersedia.
          </div>
        )}
      </div>
    </PreviewFrame>
  );
}

function PreviewFrame({
  title,
  subtitle,
  loading,
  icon,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d] text-[#6c5ce7]">
            {icon}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
              {title}
            </p>
            <h3 className="mt-1 text-base font-semibold text-[#f6f7f8]">
              {subtitle}
            </h3>
          </div>
        </div>
        {action}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center text-sm text-[#7a7d82]">
          Loading preview...
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function ReviewPreview({ id, extension }: { id: string; extension?: string }) {
  const normalizedExtension = normalizeExtension(extension);

  if (normalizedExtension === "docx" || normalizedExtension === "doc" || normalizedExtension === "rtf") {
    return <WordPreview id={id} />;
  }

  if (normalizedExtension === "xlsx" || normalizedExtension === "xls") {
    return <ExcelPreview id={id} />;
  }

  if (normalizedExtension === "pdf") {
    return <PdfPreview id={id} />;
  }

  if (
    normalizedExtension === "ppt" ||
    normalizedExtension === "pptx" ||
    normalizedExtension === "pps" ||
    normalizedExtension === "ppsx"
  ) {
    return <PowerpointPreview id={id} />;
  }

  return (
    <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-5 py-6 text-sm text-[#7a7d82]">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-[#f6f7f8]">No preview available</p>
          <p className="mt-1 leading-6">
            This file type is not yet wired to an inline review preview. You can still inspect the revision history and accept the document.
          </p>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#222426] bg-[#1a1b1d] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[#e8e9ea]">{value}</p>
    </div>
  );
}

export default function ReviewDocumentPage({ id }: ReviewDocumentPageProps) {
  const router = useRouter();
  const { loading, record, error, fetchRecord, accepting, acceptDocument } =
    useReviewDocument(id);

  const normalizedExtension = normalizeExtension(record?.file.extension);
  const latestRevision = record?.revisions?.[0];

  return (
    <PageWrapper isLoading={loading} className="min-h-dvh">
      <main className="flex min-h-dvh flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222426] px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(PageRoutes.repositoryReview)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
              >
                <ArrowLeft size={15} />
                Back
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
                  Review viewer
                </p>
                <h1 className="mt-1 text-xl font-semibold text-[#f5f6f7]">
                  {record?.file.name ?? "Review document"}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchRecord(id)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
              >
                <RefreshCw size={15} />
                Reload
              </button>
              <button
                type="button"
                onClick={async () => {
                  await acceptDocument(id);
                  router.push(PageRoutes.repositoryReview);
                }}
                disabled={accepting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={15} />
                {accepting ? "Accepting..." : "Accept document"}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
              {error ? (
                <div className="rounded-3xl border border-[#3f2020] bg-[rgba(255,107,107,0.06)] px-6 py-5 text-[#ffb4b4]">
                  <p className="text-sm font-semibold">Unable to load file</p>
                  <p className="mt-1 text-sm leading-6 text-[#ffcccc]">{error}</p>
                </div>
              ) : null}

              <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="space-y-5">
                  <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <SummaryCard
                        label="Extension"
                        value={record?.file.extension ?? "-"}
                      />
                      <SummaryCard
                        label="Size"
                        value={formatSize(record?.file.size)}
                      />
                      <SummaryCard
                        label="Created by"
                        value={record?.file.createdBy || "-"}
                      />
                      <SummaryCard
                        label="Requested at"
                        value={formatDate(latestRevision?.createdAt)}
                      />
                    </div>
                  </section>

                  <ReviewPreview
                    id={id}
                    extension={normalizedExtension}
                  />
                </div>

                <aside className="space-y-5">
                  <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
                      Review summary
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3">
                        <p className="text-xs text-[#7a7d82]">Status</p>
                        <p className="mt-1 text-sm font-medium text-[#e8e9ea]">
                          {record?.file.isDeleted ? "Archived" : "Active"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3">
                        <p className="text-xs text-[#7a7d82]">Path</p>
                        <p className="mt-1 break-all text-sm font-medium text-[#e8e9ea]">
                          {record?.file.path ?? "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3">
                        <p className="text-xs text-[#7a7d82]">Reviewed through</p>
                        <p className="mt-1 text-sm font-medium text-[#e8e9ea]">
                          {record ? `${record.revisions.length} revisions` : "-"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
                          Revision history
                        </p>
                        <h2 className="mt-1 text-base font-semibold text-[#f6f7f8]">
                          Latest changes
                        </h2>
                      </div>
                      <p className="text-sm text-[#7a7d82]">
                        {record?.revisions?.length ?? 0} entries
                      </p>
                    </div>

                    {latestRevision ? (
                      <div className="mt-4 rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3 text-sm text-[#7a7d82]">
                        <p className="text-[#e8e9ea]">
                          Latest revision v{latestRevision.versionNumber}
                        </p>
                        <p className="mt-1">{formatDate(latestRevision.createdAt)}</p>
                        <p className="mt-1">{formatSize(latestRevision.size)}</p>
                      </div>
                    ) : null}

                    <div className="mt-4">
                      <RevisionTimeline revisions={record?.revisions ?? []} />
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
