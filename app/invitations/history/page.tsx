"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { useInvitations } from "@/lib/features/invitations/hooks/useInvitations";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageRoutes } from "@/lib/cores/utils/navigation";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

export default function InvitationHistoryPage() {
  const router = useRouter();
  const { hydrated, processedInvitations } = useInvitations();

  return (
    <PageWrapper isLoading={!hydrated}>
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#f6f7f8]">
              Processed invitations
            </h2>
            <p className="text-sm text-[#7a7d82]">
              Semua invitation yang sudah di-accept atau di-decline akan muncul
              di sini.
            </p>
          </div>

          <div className="grid gap-4">
            {processedInvitations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center text-sm text-[#7a7d82]">
                Belum ada invitation yang diproses.
              </div>
            ) : (
              processedInvitations.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                            item.status === "accepted"
                              ? "bg-[#1f3026] text-[#8be3a3]"
                              : "bg-[#31231f] text-[#ffb199]"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="rounded-full border border-[#2a2c2e] px-3 py-1 text-xs text-[#7a7d82]">
                          {item.role}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-[#f6f7f8]">
                        {item.teamName}
                      </h3>
                      <p className="text-sm text-[#7a7d82]">
                        {item.repositoryName}
                      </p>
                    </div>

                    <div className="text-sm text-[#7a7d82]">
                      <div>Processed by {item.inviterName}</div>
                      <div>{item.decidedAt ? formatDate(item.decidedAt) : "-"}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(PageRoutes.repositoryInvitationDetail(item.id))}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
                    >
                      Review
                    </button>
                    {item.status === "accepted" ? (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-[#1f3026] px-4 py-2 text-sm text-[#8be3a3]">
                        <CheckCircle2 size={15} />
                        Accepted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-[#31231f] px-4 py-2 text-sm text-[#ffb199]">
                        <XCircle size={15} />
                        Declined
                      </span>
                    )}
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
