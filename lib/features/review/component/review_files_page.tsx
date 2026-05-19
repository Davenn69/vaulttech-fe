"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  FileSearch,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useReviewFiles } from "../hooks/useReviewFiles";

function formatSize(size: number) {
  if (!Number.isFinite(size)) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  return `${currentSize.toFixed(currentSize >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_review":
      return "In review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "ready":
      return "Ready";
    default:
      return "Reviewable";
  }
}

export default function ReviewFilesPage() {
  const router = useRouter();
  const { hydrated, loading, error, reviewFiles, fetchReviewFiles } =
    useReviewFiles();

  return (
    <PageWrapper isLoading={!hydrated || loading}>
      <main className="flex min-h-screen flex-1 flex-col overflow-y-auto bg-[#0f1011] px-6 py-6 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
          <div className="flex flex-col gap-4 border-b border-[#222426] pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#111213] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#7a7d82]">
                <FileSearch size={12} />
                Review queue
              </div>
              <h2 className="text-lg font-semibold text-[#f6f7f8]">
                Files that can be reviewed
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                void fetchReviewFiles();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-[#3f2020] bg-[rgba(255,107,107,0.06)] px-4 py-3 text-[#ffb4b4]">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold">
                    Unable to load review files
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#ffcccc]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4">
            {reviewFiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center">
                <ShieldCheck className="mx-auto text-[#7a7d82]" size={24} />
                <h3 className="mt-3 text-base font-medium text-[#f6f7f8]">
                  No reviewable files found
                </h3>
                <p className="mt-1 text-sm text-[#7a7d82]">
                  When the review backend returns files, they will appear here.
                </p>
              </div>
            ) : (
              reviewFiles.map((item) => (
                <article
                  key={item.file.id}
                  className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#252729] px-3 py-1 text-xs uppercase tracking-wide text-[#7a7d82]">
                          {getStatusLabel(item.invitation.status)}
                        </span>
                        <span className="rounded-full border border-[#2a2c2e] px-3 py-1 text-xs text-[#7a7d82]">
                          {item.file.extension}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-[#f6f7f8]">
                          {item.file.name}
                        </h3>
                        <p className="mt-1 text-sm text-[#7a7d82]">
                          {item.file.path}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-[#7a7d82]">
                        <span className="rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
                          Size: {formatSize(item.file.size)}
                        </span>
                        <span className="rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
                          Created by: {item.file.createdBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          router.push(PageRoutes.repositoryReviewDetail(item.file.id));
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0]"
                      >
                        Review file
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
