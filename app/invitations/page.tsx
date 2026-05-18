"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Clock3, XCircle } from "lucide-react";
import { useInvitations } from "@/lib/features/invitations/hooks/useInvitations";
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

export default function InvitationsPage() {
  const router = useRouter();
  const { hydrated, pendingInvitations, acceptInvitation, declineInvitation } =
    useInvitations();

  return (
    <PageWrapper isLoading={!hydrated}>
      <main className="flex min-h-screen flex-1 flex-col overflow-y-auto bg-[#0f1011] px-6 py-6 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#f6f7f8]">
                Pending invitations ({pendingInvitations.length})
              </h2>
              <p className="mt-1 text-sm text-[#7a7d82]">
                Review pending requests, then accept or decline.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {pendingInvitations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center">
                <Clock3 className="mx-auto text-[#7a7d82]" size={24} />
                <h3 className="mt-3 text-base font-medium text-[#f6f7f8]">
                  No pending invitations
                </h3>
                <p className="mt-1 text-sm text-[#7a7d82]">
                  Semua invitation sudah diproses.
                </p>
              </div>
            ) : (
              pendingInvitations.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#252729] px-3 py-1 text-xs uppercase tracking-wide text-[#7a7d82]">
                          {item.status}
                        </span>
                        <span className="rounded-full border border-[#2a2c2e] px-3 py-1 text-xs text-[#7a7d82]">
                          {item.role}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#f6f7f8]">
                          {item.teamName}
                        </h3>
                        <p className="text-sm text-[#7a7d82]">
                          {item.repositoryName}
                        </p>
                      </div>

                      <p className="max-w-3xl text-sm leading-6 text-[#c5c7ca]">
                        {item.message}
                      </p>

                      <div className="text-sm text-[#7a7d82]">
                        Invited by{" "}
                        <span className="text-[#e8e9ea]">
                          {item.inviterName}
                        </span>{" "}
                        on {formatDate(item.sentAt)}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            PageRoutes.repositoryInvitationDetail(item.id),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
                      >
                        View detail
                        <ChevronRight size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => acceptInvitation(item.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0]"
                      >
                        <CheckCircle2 size={15} />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => declineInvitation(item.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#fd7c5a] transition-colors hover:bg-[#252729]"
                      >
                        <XCircle size={15} />
                        Decline
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
