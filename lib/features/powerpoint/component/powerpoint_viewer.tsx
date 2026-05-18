"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { Download, ExternalLink, RefreshCw, Presentation } from "lucide-react";
import usePowerpoint from "../hooks/usePowerpoint";
import { PowerpointViewerProps } from "../types/powerpoint";

export default function PowerpointViewer({ id }: PowerpointViewerProps) {
  const { loading, fileName, downloadUrl, viewerUrl, fetchPowerpoint } =
    usePowerpoint(id);

  const activeName = fileName ?? "PowerPoint presentation";

  console.log(fileName);

  return (
    <PageWrapper isLoading={loading} className="min-h-dvh">
      <main className="flex min-h-dvh flex-1 overflow-hidden bg-[#0d1014] text-[#eef1f4]">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))] px-5 py-4">
            <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3c4b63] bg-[#142033] text-[#8fb4ff] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <Presentation size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                    PowerPoint viewer
                  </p>
                  <h1 className="truncate text-xl font-semibold text-white">
                    {activeName}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void fetchPowerpoint(id)}
                  className="tool-btn"
                >
                  <RefreshCw size={16} />
                  Reload
                </button>
                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="tool-btn"
                  >
                    <Download size={16} />
                    Download
                  </a>
                ) : null}
                {viewerUrl ? (
                  <a
                    href={viewerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="tool-btn"
                  >
                    <ExternalLink size={16} />
                    Open in new tab
                  </a>
                ) : null}
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mx-auto flex h-full min-h-[calc(100vh-160px)] w-full max-w-[1400px] flex-col gap-4">
              <div className="rounded-[28px] border border-white/10 bg-[#10151d] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-sm text-white/60">
                  <span>
                    Slides are rendered through Microsoft Office web viewer.
                  </span>
                  <span className="truncate">
                    {viewerUrl ? "Ready" : "Waiting for file"}
                  </span>
                </div>

                <div className="h-[calc(100vh-250px)] min-h-[560px] overflow-hidden rounded-b-[28px] bg-[#0b0f14]">
                  {viewerUrl ? (
                    <iframe
                      title={activeName}
                      src={viewerUrl}
                      className="h-full w-full bg-white"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/55">
                      PowerPoint preview belum tersedia. Pastikan backend
                      mengembalikan signed download URL yang bisa diakses oleh
                      Microsoft Office web viewer.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.2);
          padding: 0.6rem 0.95rem;
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.88);
          transition:
            background-color 150ms ease,
            border-color 150ms ease,
            transform 150ms ease;
        }

        .tool-btn:hover {
          border-color: rgba(143, 180, 255, 0.35);
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }
      `}</style>
    </PageWrapper>
  );
}
