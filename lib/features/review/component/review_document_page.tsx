"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import RevisionTimeline from "@/lib/features/record/components/revision_timeline";
import useRecord from "../../record/hooks/useRecord";
import {
  formatDate,
  formatSize,
  normalizeExtension,
} from "../utils/review_document";
import ReviewDeclineModal from "./review_decline_modal";
import ReviewDocumentPreview from "./review_document_preview";
import { useReviewComments } from "../hooks/useReviewComments";
import { useReviewDocument } from "../hooks/useReviewDocument";

type ReviewDocumentPageProps = {
  documentSupervisorId: string;
  fileId?: string;
  mode?: "reviewable" | "reviewed";
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#222426] bg-[#1a1b1d] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[#e8e9ea]">{value}</p>
    </div>
  );
}

function CommentCard({ entry }: { entry: unknown }) {
  const record =
    entry && typeof entry === "object"
      ? (entry as Record<string, unknown>)
      : undefined;

  const supervisorNameSource =
    record?.supervisorName ??
    record?.createdBy ??
    record?.documentSupervisorId ??
    record?.supervisorId ??
    record?.name ??
    record?.email ??
    record?.id;
  const createdAtSource = record?.createdAt;
  const commentSource = record?.comment ?? record?.message ?? entry;

  const supervisorName =
    typeof supervisorNameSource === "string" ||
    typeof supervisorNameSource === "number" ||
    typeof supervisorNameSource === "boolean"
      ? String(supervisorNameSource)
      : "Supervisor";
  const createdAt =
    typeof createdAtSource === "string" ||
    typeof createdAtSource === "number" ||
    typeof createdAtSource === "boolean"
      ? String(createdAtSource)
      : "-";
  const commentText =
    typeof commentSource === "string" ||
    typeof commentSource === "number" ||
    typeof commentSource === "boolean"
      ? String(commentSource)
      : "-";

  return (
    <article className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#f6f7f8]">{supervisorName}</p>
          <p className="mt-1 text-xs text-[#7a7d82]">{formatDate(createdAt)}</p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#d7d9dd]">
        {commentText}
      </p>
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
    <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-5 py-10 text-center">
      <MessageSquareText className="mx-auto text-[#7a7d82]" size={24} />
      <h3 className="mt-3 text-base font-medium text-[#f6f7f8]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#7a7d82]">{description}</p>
    </div>
  );
}

export default function ReviewDocumentPage({
  documentSupervisorId,
  fileId,
  mode = "reviewable",
}: ReviewDocumentPageProps) {
  const router = useRouter();
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const isReviewedView = mode === "reviewed";

  const {
    previewLoading,
    accepting,
    acceptDocument,
    declining,
    declineDocument,
    reviewDetail,
    signedUrl,
    fetchUrl,
  } = useReviewDocument(fileId);
  const { record, fetchRecord, loading: recordLoading } = useRecord(fileId);
  const {
    loading: commentsLoading,
    error: commentsError,
    comments,
    reviewComments,
    fetchComments,
  } = useReviewComments(isReviewedView ? fileId : undefined);

  const normalizedExtension = normalizeExtension(reviewDetail?.file.extension);
  const latestRevision = record?.revisions?.[0];
  const isWordEditable = ["docx", "doc", "rtf"].includes(normalizedExtension);

  const reloadAll = () => {
    if (fileId) {
      void fetchRecord(fileId);
      void fetchUrl(fileId);
    }

    if (isReviewedView) {
      void fetchComments(fileId);
    }
  };

  const openWordEditor = () => {
    if (!fileId || !isWordEditable) return;

    router.push(PageRoutes.wordFile(fileId));
  };

  return (
    <PageWrapper isLoading={recordLoading}>
      <main className="flex min-h-dvh flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222426] px-5 py-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
                  {isReviewedView ? "Reviewed detail" : "Review viewer"}
                </p>
                <h1 className="mt-1 text-xl font-semibold text-[#f5f6f7]">
                  {reviewDetail?.file.name ?? "Review document"}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={reloadAll}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
              >
                <RefreshCw size={15} />
                Reload
              </button>

              {isReviewedView ? (
                <button
                  type="button"
                  onClick={openWordEditor}
                  disabled={!fileId || !isWordEditable}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <BookOpen size={15} />
                  Open in Word editor
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={accepting || declining}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#3f2020] bg-[rgba(255,107,107,0.08)] px-4 py-2 text-sm font-medium text-[#ffb4b4] transition-colors hover:bg-[rgba(255,107,107,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={15} />
                    Decline document
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await acceptDocument(documentSupervisorId);
                      router.push(PageRoutes.repositoryReview);
                    }}
                    disabled={accepting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={15} />
                    {accepting ? "Accepting..." : "Accept document"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
              <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="space-y-5">
                  <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <SummaryCard
                        label="Extension"
                        value={reviewDetail?.file.extension ?? "-"}
                      />
                      <SummaryCard
                        label="Size"
                        value={formatSize(reviewDetail?.file.size)}
                      />
                      <SummaryCard
                        label="Created by"
                        value={reviewDetail?.file.createdBy || "-"}
                      />
                      <SummaryCard
                        label="Mode"
                        value={isReviewedView ? "Reviewed" : "Reviewable"}
                      />
                    </div>
                    {signedUrl ? (
                      <p className="mt-4 break-all text-xs text-[#7a7d82]">
                        Signed URL loaded for inline preview and download
                        access.
                      </p>
                    ) : null}
                  </section>

                  <ReviewDocumentPreview
                    signedUrl={signedUrl}
                    extension={normalizedExtension}
                    fileName={reviewDetail?.file.name}
                    loading={previewLoading}
                    onReload={() => {
                      if (!fileId) return;
                      void fetchUrl(fileId);
                    }}
                  />
                </div>

                <aside className="space-y-5">
                  <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
                      Review summary
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3"></div>
                      <div className="rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3">
                        <p className="text-xs text-[#7a7d82]">Path</p>
                        <p className="mt-1 break-all text-sm font-medium text-[#e8e9ea]">
                          {record?.file.path ?? "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3">
                        <p className="text-xs text-[#7a7d82]">
                          Reviewed through
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#e8e9ea]">
                          {record
                            ? `${record.revisions.length} revisions`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {isReviewedView ? (
                    <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
                            Word editor
                          </p>
                          <h2 className="mt-1 text-base font-semibold text-[#f6f7f8]">
                            Continue editing this file
                          </h2>
                        </div>
                        <Clock3 className="text-[#7a7d82]" size={16} />
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#7a7d82]">
                        Buka file ini di Word editor untuk melanjutkan revisi
                        langsung dari dokumen yang sudah direview.
                      </p>

                      <button
                        type="button"
                        onClick={openWordEditor}
                        disabled={!fileId || !isWordEditable}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <BookOpen size={15} />
                        Open Word editor
                      </button>
                    </section>
                  ) : null}

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
                        <p className="mt-1">
                          {formatDate(latestRevision.createdAt)}
                        </p>
                        <p className="mt-1">
                          {formatSize(latestRevision.size)}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4">
                      <RevisionTimeline revisions={record?.revisions ?? []} />
                    </div>
                  </section>

                  {isReviewedView ? (
                    <section className="mb-6 rounded-3xl border border-[#222426] bg-[#151618] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
                            Supervisor comments
                          </p>
                          <h2 className="mt-1 text-base font-semibold text-[#f6f7f8]">
                            Feedback from review backend
                          </h2>
                        </div>
                        <p className="text-sm text-[#7a7d82]">
                          {comments.length} comments
                        </p>
                      </div>

                      {commentsLoading ? (
                        <div className="mt-4 rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center text-sm text-[#7a7d82]">
                          Loading supervisor comments...
                        </div>
                      ) : commentsError ? (
                        <div className="mt-4 rounded-2xl border border-[#3f2020] bg-[rgba(255,107,107,0.06)] px-4 py-3 text-[#ffb4b4]">
                          <p className="text-sm font-semibold">
                            Unable to load comments
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#ffcccc]">
                            {commentsError}
                          </p>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="mt-4">
                          <EmptyState
                            title="No supervisor comments"
                            description="When backend returns comments from the supervisor, they will be shown here."
                          />
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {comments.map((comment, index) => (
                            <CommentCard
                              key={`${comment.id ?? "comment"}-${comment.createdAt ?? "unknown"}-${index}`}
                              entry={comment}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  ) : null}
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>

      {!isReviewedView ? (
        <ReviewDeclineModal
          open={isDeclineModalOpen}
          isLoading={declining}
          onClose={() => setIsDeclineModalOpen(false)}
          onSubmit={async (comment) => {
            await declineDocument(documentSupervisorId, comment);
            setIsDeclineModalOpen(false);
            router.push(PageRoutes.repositoryReview);
          }}
        />
      ) : null}
    </PageWrapper>
  );
}
