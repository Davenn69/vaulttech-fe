"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { useInvitations } from "@/lib/features/invitations/hooks/useInvitations";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

export default function InvitationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { hydrated, getInvitation, acceptInvitation, declineInvitation } =
    useInvitations();

  const invitation = id ? getInvitation(id) : null;

  return (
    <PageWrapper isLoading={!hydrated}>
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(PageRoutes.repositoryInvitations)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <div className="text-sm text-[#7a7d82]">
            Invitation detail and processing
          </div>
        </div>

        {!invitation ? (
          <section className="rounded-3xl border border-[#222426] bg-[#151618] p-8 text-center">
            <FileText className="mx-auto text-[#7a7d82]" size={28} />
            <h2 className="mt-3 text-lg font-semibold text-[#f6f7f8]">
              Invitation not found
            </h2>
            <p className="mt-1 text-sm text-[#7a7d82]">
              ID invitation yang dipilih tidak tersedia di daftar saat ini.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-3xl border border-[#222426] bg-[#151618] p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#252729] px-3 py-1 text-xs uppercase tracking-wide text-[#7a7d82]">
                  {invitation.status}
                </span>
                <span className="rounded-full border border-[#2a2c2e] px-3 py-1 text-xs text-[#7a7d82]">
                  {invitation.role}
                </span>
                {invitation.decidedAt && (
                  <span className="rounded-full border border-[#2a2c2e] px-3 py-1 text-xs text-[#7a7d82]">
                    Decided {formatDate(invitation.decidedAt)}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#f6f7f8]">
                {invitation.teamName}
              </h1>
              <p className="mt-1 text-sm text-[#7a7d82]">
                {invitation.repositoryName}
              </p>

              <div className="mt-6 rounded-2xl border border-[#2a2c2e] bg-[#111213] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-[#7a7d82]">
                  <Clock3 size={15} />
                  Sent on {formatDate(invitation.sentAt)}
                </div>
                <p className="text-sm leading-7 text-[#c5c7ca]">
                  {invitation.message}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => acceptInvitation(invitation.id)}
                  disabled={invitation.status !== "pending"}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  Accept invitation
                </button>
                <button
                  type="button"
                  onClick={() => declineInvitation(invitation.id)}
                  disabled={invitation.status !== "pending"}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2.5 text-sm text-[#fd7c5a] transition-colors hover:bg-[#252729] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={15} />
                  Decline invitation
                </button>
              </div>
            </div>

            <aside className="rounded-3xl border border-[#222426] bg-[#151618] p-6">
              <h2 className="text-lg font-semibold text-[#f6f7f8]">Summary</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#7a7d82]">Inviter</dt>
                  <dd className="text-right text-[#e8e9ea]">
                    {invitation.inviterName}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#7a7d82]">Role</dt>
                  <dd className="text-right text-[#e8e9ea]">{invitation.role}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#7a7d82]">Status</dt>
                  <dd className="text-right text-[#e8e9ea]">
                    {invitation.status}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#7a7d82]">Repository</dt>
                  <dd className="text-right text-[#e8e9ea]">
                    {invitation.repositoryName}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#7a7d82]">Sent at</dt>
                  <dd className="text-right text-[#e8e9ea]">
                    {formatDate(invitation.sentAt)}
                  </dd>
                </div>
                {invitation.decidedAt && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[#7a7d82]">Decided at</dt>
                    <dd className="text-right text-[#e8e9ea]">
                      {formatDate(invitation.decidedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
          </section>
        )}
      </main>
    </PageWrapper>
  );
}
