"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useReviewDocument } from "../hooks/useReviewDocument";
import RevisionTimeline from "@/lib/features/record/components/revision_timeline";
import ReviewDocumentPreview from "./review_document_preview";
import {
  formatDate,
  formatSize,
  normalizeExtension,
} from "../utils/review_document";
import useRecord from "../../record/hooks/useRecord";

type ReviewDocumentPageProps = {
  id: string;
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

export default function ReviewDocumentPage({ id }: ReviewDocumentPageProps) {
  const router = useRouter();
  const {
    previewLoading,
    accepting,
    acceptDocument,
    reviewDetail,
    signedUrl,
  } = useReviewDocument(id);
  const { record, fetchRecord, loading: recordLoading } = useRecord(id);

  const normalizedExtension = normalizeExtension(reviewDetail?.file.extension);
  const latestRevision = record?.revisions?.[0];

  return (
    <PageWrapper isLoading={recordLoading} className="min-h-dvh">
      <main className="flex min-h-dvh flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222426] px-5 py-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
                  Review viewer
                </p>
                <h1 className="mt-1 text-xl font-semibold text-[#f5f6f7]">
                  {reviewDetail?.file.name}
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
                    onReload={() => void fetchRecord(id)}
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
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
