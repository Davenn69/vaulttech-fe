"use client";

import { Download, ExternalLink, FileText, RefreshCw } from "lucide-react";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import usePdf from "../hooks/usePdf";

type PdfViewerProps = {
  id: string;
};

export default function PdfViewer({ id }: PdfViewerProps) {
  const { loading, downloadUrl, pdfUrl, fileName, fetchPdf } = usePdf(id);

  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName || "document.pdf";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <PageWrapper isLoading={loading}>
      <main className="flex h-full min-h-0 flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222426] bg-[#121315] px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
                PDF viewer
              </p>
              <h1 className="mt-2 truncate text-2xl font-semibold text-[#f5f6f7]">
                {fileName || "PDF document"}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchPdf(id)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729]"
              >
                <RefreshCw size={15} />
                Reload
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!downloadUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={15} />
                Download
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

          <div className="min-h-0 flex-1 overflow-hidden p-5">
            <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-4">
              <div className="rounded-2xl border border-[#222426] bg-[#121315] px-4 py-3 text-sm text-[#c3c3c3]">
                <div className="flex items-center gap-2 text-[#e8e9ea]">
                  <FileText size={16} />
                  <span className="font-medium">
                    {pdfUrl ? "PDF rendered inline" : "No PDF available"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#7a7d82]">
                  File diambil sebagai blob dari backend lalu ditampilkan tanpa
                  memicu download.
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-[#222426] bg-[#0f1011]">
                {pdfUrl ? (
                  <iframe
                    title={fileName || "PDF document"}
                    src={pdfUrl}
                    className="h-full min-h-[75vh] w-full bg-white"
                  />
                ) : (
                  <div className="flex h-full min-h-[75vh] items-center justify-center p-6 text-center text-sm text-[#7a7d82]">
                    PDF belum tersedia. Coba reload atau pastikan backend
                    mengembalikan file PDF yang bisa diambil sebagai blob.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
