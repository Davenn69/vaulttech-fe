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
              All invitations that have been accepted or declined will appear
              here.
            </p>
          </div>

          <div className="grid gap-4">
            {processedInvitations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center text-sm text-[#7a7d82]">
                No processed invitations yet.
              </div>
            ) : (
              processedInvitations.map((item) => (
                <article
                  key={item.invitation.id}
                  className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                            item.invitation.status === "accept"
                              ? "bg-[#1f3026] text-[#8be3a3]"
                              : "bg-[#31231f] text-[#ffb199]"
                          }`}
                        >
                          {item.invitation.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          PageRoutes.repositoryInvitationDetail(
                            item.invitation.id,
                          ),
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
                    >
                      Review
                    </button>
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
