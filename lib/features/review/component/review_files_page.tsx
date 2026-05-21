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
  Clock3,
  CircleDashed,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import { useReviewFiles } from "../hooks/useReviewFiles";
import { ReviewFileModel } from "../types/review_file";

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
    case "accept":
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "pending":
      return "Pending";
    default:
      return "Reviewable";
  }
}

function getStatusTone(status?: string) {
  switch (status) {
    case "accept":
    case "accepted":
      return "border-[#23412f] bg-[rgba(52,211,153,0.10)] text-[#86efac]";
    case "rejected":
      return "border-[#4a2525] bg-[rgba(255,107,107,0.10)] text-[#ffb4b4]";
    case "pending":
      return "border-[#4a3a1f] bg-[rgba(251,191,36,0.10)] text-[#facc15]";
    default:
      return "border-[#2a2c2e] bg-[#1a1b1d] text-[#7a7d82]";
  }
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "accept":
    case "accepted":
      return <CircleCheck size={12} />;
    case "rejected":
      return <CircleAlert size={12} />;
    case "pending":
      return <Clock3 size={12} />;
    default:
      return <CircleDashed size={12} />;
  }
}

function getProgressValue(status?: string) {
  switch (status) {
    case "accept":
    case "accepted":
      return 100;
    case "rejected":
      return 100;
    case "pending":
      return 45;
    default:
      return 20;
  }
}

function getProgressLabel(status?: string) {
  switch (status) {
    case "accept":
    case "accepted":
      return "Completed";
    case "rejected":
      return "Declined";
    case "pending":
      return "Waiting action";
    default:
      return "Reviewable";
  }
}

function ReviewFileCard({
  item,
  onOpen,
}: {
  item: ReviewFileModel;
  onOpen: () => void;
}) {
  return (
    <article className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusTone(item.invitation.status)}`}
            >
              {getStatusIcon(item.invitation.status)}
              {getStatusLabel(item.invitation.status)}
            </span>
            <span className="rounded-full border border-[#2a2c2e] px-3 py-1 text-xs text-[#7a7d82]">
              {item.file.extension || "file"}
            </span>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#f6f7f8]">
              {item.file.name}
            </h3>
            <p className="mt-1 break-all text-sm text-[#7a7d82]">
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
            <span className="rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1">
              Invited by: {item.invitation.invitedBy}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0]"
          >
            Review file
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ReviewedFileCard({ item }: { item: ReviewFileModel }) {
  const progress = getProgressValue(item.invitation.status);

  return (
    <article className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusTone(item.invitation.status)}`}
            >
              {getStatusIcon(item.invitation.status)}
              {getProgressLabel(item.invitation.status)}
            </span>
            <span className="rounded-full border border-[#2a2c2e] px-3 py-1 text-xs text-[#7a7d82]">
              {item.file.extension || "file"}
            </span>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#f6f7f8]">
              {item.file.name}
            </h3>
            <p className="mt-1 break-all text-sm text-[#7a7d82]">
              {item.file.path}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center">
      <ShieldCheck className="mx-auto text-[#7a7d82]" size={24} />
      <h3 className="mt-3 text-base font-medium text-[#f6f7f8]">{title}</h3>
      <p className="mt-1 text-sm text-[#7a7d82]">{description}</p>
    </div>
  );
}

export default function ReviewFilesPage() {
  const router = useRouter();
  const {
    hydrated,
    loading,
    error,
    reviewableFiles,
    reviewedFiles,
    fetchReviewFiles,
  } = useReviewFiles();

  return (
    <PageWrapper isLoading={!hydrated || loading}>
      <main className="flex min-h-screen flex-1 flex-col overflow-y-auto bg-[#0f1011] px-6 py-6 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
          <div className="flex flex-col gap-4 border-b border-[#222426] pb-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2c2e] bg-[#111213] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#7a7d82]">
                <FileSearch size={12} />
                Review files
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#f6f7f8]">
                  Reviewable and reviewed files
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#7a7d82]">
                  Bagian ini memisahkan file yang masih bisa di-accept atau
                  decline, dan file yang sudah direview untuk memantau status
                  progress-nya.
                </p>
              </div>
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

          <div className="mt-5 grid gap-5">
            <section className="rounded-3xl border border-[#222426] bg-[#121315] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
                    Reviewable files
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[#f6f7f8]">
                    Files waiting for your accept action
                  </h3>
                </div>
                <span className="rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1 text-xs text-[#7a7d82]">
                  {reviewableFiles.length} items
                </span>
              </div>

              <div className="mt-4 grid gap-4">
                {reviewableFiles.length === 0 ? (
                  <EmptyState
                    title="No reviewable files found"
                    description="When the review backend returns files that can be accepted or declined, they will appear here."
                  />
                ) : (
                  reviewableFiles.map((item) => (
                    <ReviewFileCard
                      key={item.file.id}
                      item={item}
                      onOpen={() => {
                        router.push(
                          `${PageRoutes.repositoryReviewDetail(item.invitation.id)}?fileId=${encodeURIComponent(item.file.id)}`,
                        );
                      }}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[#222426] bg-[#121315] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
                    Reviewed files
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[#f6f7f8]">
                    Files with current progress status
                  </h3>
                </div>
                <span className="rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1 text-xs text-[#7a7d82]">
                  {reviewedFiles.length} items
                </span>
              </div>

              <div className="mt-4 grid gap-4">
                {reviewedFiles.length === 0 ? (
                  <EmptyState
                    title="No reviewed files yet"
                    description="Once a file has been accepted or rejected, its progress will be shown here."
                  />
                ) : (
                  reviewedFiles.map((item) => (
                    <ReviewedFileCard key={item.file.id} item={item} />
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
