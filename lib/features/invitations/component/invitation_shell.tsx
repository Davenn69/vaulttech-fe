"use client";

import { PageRoutes } from "@/lib/cores/utils/navigation";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type InvitationShellProps = {
  children: ReactNode;
};

export default function InvitationShell({ children }: InvitationShellProps) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#0f1011] text-[#e8e9ea]">
      <header className="border-b border-[#222426] bg-[#111213] px-6 py-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(PageRoutes.repository)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-[#f6f7f8]">
                Manage team invitations
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#7a7d82]">
                Review pending requests, accept or decline access, then check
                the history tab for processed invitations.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
