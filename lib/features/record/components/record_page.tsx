"use client";

import { useEffect, useMemo, useState } from "react";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useRecord from "../hooks/useRecord";
import RecordHeader from "./record_header";
import RevisionTimeline from "./revision_timeline";

type RecordPageProps = {
  id: string;
};

function normalizeExtension(extension?: string) {
  return (extension ?? "").replace(/^\./, "").toLowerCase();
}

function isWordFile(extension?: string) {
  return ["doc", "docx", "rtf"].includes(normalizeExtension(extension));
}

function isExcelFile(extension?: string) {
  return ["xls", "xlsx", "csv"].includes(normalizeExtension(extension));
}

function isPdfFile(extension?: string) {
  return normalizeExtension(extension) === "pdf";
}

function isPreviewable(extension?: string) {
  return isWordFile(extension) || isExcelFile(extension) || isPdfFile(extension);
}

const OFFICE_VIEWER_BASE =
  "https://view.officeapps.live.com/op/embed.aspx?src=";

export default function RecordPage({ id }: RecordPageProps) {
  const router = useRouter();
  const {
    loading,
    revertingRevisionId,
    record,
    error,
    fetchRecord,
    revertRevision,
    downloadRevision,
  } = useRecord(id);
  const fileExtension = record?.file.extension;
  const [selectedRevisionId, setSelectedRevisionId] = useState<string>();
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [activePreviewName, setActivePreviewName] = useState<string>();
  const [activePreviewSize, setActivePreviewSize] = useState<number>();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>();

  useEffect(() => {
    setSelectedRevisionId(undefined);
  }, [record?.file.id]);

  useEffect(() => {
    const fileId = record?.file.id;
    if (!fileId) return;

    let cancelled = false;

    const fetchDownloadUrl = async () => {
      setPreviewLoading(true);
      setPreviewError(undefined);
      setDownloadUrl(undefined);
      setActivePreviewName(undefined);
      setActivePreviewSize(undefined);

      try {
        if (selectedRevisionId) {
          const revisionPayload = await downloadRevision(
            fileId,
            selectedRevisionId,
          );

          if (cancelled) return;

          setDownloadUrl(revisionPayload.downloadUrl);
          setActivePreviewName(revisionPayload.name);
          setActivePreviewSize(revisionPayload.size);
          return;
        }

        const res = await api.get<ApiResponse<{ downloadUrl?: string }>>(
          `/file/download/${fileId}`,
        );

        if (cancelled) return;
        setDownloadUrl(res.data.downloadUrl);
        setActivePreviewName(record?.file.name);
        setActivePreviewSize(record?.file.size);
      } catch (caughtError) {
        if (cancelled) return;

        const message = axios.isAxiosError<ApiResponseError>(caughtError)
          ? caughtError.response?.data.message
          : "Failed to load file preview";

        const nextMessage = message ?? "Failed to load file preview";
        setPreviewError(nextMessage);
        toast.error(nextMessage);
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    void fetchDownloadUrl();

    return () => {
      cancelled = true;
    };
  }, [downloadRevision, record?.file.id, record?.file.name, record?.file.size, selectedRevisionId]);

  const viewerUrl = useMemo(() => {
    if (!downloadUrl || !isPreviewable(fileExtension)) return undefined;

    if (isWordFile(fileExtension) || isExcelFile(fileExtension)) {
      return `${OFFICE_VIEWER_BASE}${encodeURIComponent(downloadUrl)}`;
    }

    return downloadUrl;
  }, [downloadUrl, fileExtension]);

  const previewLabel = isWordFile(fileExtension)
    ? "Word preview"
    : isExcelFile(fileExtension)
      ? "Excel preview"
      : isPdfFile(fileExtension)
        ? "PDF preview"
        : "File preview";
  const activePreviewLabel = selectedRevisionId
    ? `Revision preview`
    : "Current file";
  const previewHint = isWordFile(fileExtension)
    ? "Tampilan dokumen dirender melalui Microsoft Office web viewer."
    : isExcelFile(fileExtension)
      ? "Workbook dirender melalui Microsoft Office web viewer."
      : isPdfFile(fileExtension)
        ? "PDF ditampilkan langsung di dalam halaman."
        : "File ini belum punya tampilan inline di halaman record.";

  return (
    <PageWrapper isLoading={loading} className="min-h-dvh">
      <main className="flex min-h-dvh flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <RecordHeader
            title={record?.file.name ?? "Record"}
            subtitle={record?.file.extension ?? "Revision history"}
            revisionCount={record?.revisions?.length ?? 0}
            onBack={() => router.back()}
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

              <div className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
                <section className="rounded-3xl border border-[#222426] bg-[#121315] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
                        File content
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-[#f5f6f7]">
                        {record?.file.name ?? "Waiting for file data"}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c3c3c3]">
                        {previewHint}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void fetchRecord(id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729]"
                    >
                      <RefreshCw size={15} />
                      Reload
                    </button>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-[#222426] bg-[#0b0f14]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222426] px-4 py-3 text-xs text-[#7a7d82]">
                      <div className="min-w-0">
                        <span className="block">
                          {previewLabel} · {activePreviewLabel}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-[#5f6368]">
                          {activePreviewName
                            ? `${activePreviewName}${activePreviewSize != null ? ` · ${activePreviewSize} bytes` : ""}`
                            : "Loading selected file..."}
                        </span>
                      </div>
                      <span>
                        {previewLoading
                          ? "Loading preview..."
                          : downloadUrl
                            ? "Preview ready"
                            : "Preview unavailable"}
                      </span>
                    </div>

                    {previewLoading ? (
                      <div className="flex min-h-[640px] items-center justify-center px-6 py-12 text-center text-sm text-[#7a7d82]">
                        Loading file preview...
                      </div>
                    ) : previewError ? (
                      <div className="flex min-h-[640px] items-center justify-center px-6 py-12 text-center text-sm text-[#ffb4b4]">
                        {previewError}
                      </div>
                    ) : viewerUrl ? (
                      <iframe
                        title={record?.file.name ?? "File preview"}
                        src={viewerUrl}
                        className="min-h-[640px] w-full bg-white"
                      />
                    ) : (
                      <div className="flex min-h-[640px] items-center justify-center px-6 py-12 text-center text-sm text-[#7a7d82]">
                        Preview belum tersedia untuk tipe file ini.
                      </div>
                    )}
                  </div>
                </section>

                <aside className="rounded-3xl border border-[#222426] bg-[#121315] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
                        Versions
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-[#f5f6f7]">
                        Revision history
                      </h2>
                    </div>
                    <p className="text-sm text-[#7a7d82]">
                      {record?.revisions?.length ?? 0} entries
                    </p>
                  </div>

                  <div className="mt-5">
                    <RevisionTimeline
                      revisions={record?.revisions ?? []}
                      selectedRevisionId={selectedRevisionId}
                      onSelectRevision={(revision) =>
                        setSelectedRevisionId((current) =>
                          current === revision.id ? undefined : revision.id,
                        )
                      }
                      onRevertRevision={async (revision) => {
                        await revertRevision(id, revision.id);
                        setSelectedRevisionId(undefined);
                      }}
                      revertingRevisionId={revertingRevisionId}
                    />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
