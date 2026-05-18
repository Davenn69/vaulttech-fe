"use client";

import { PageRoutes } from "@/lib/cores/utils/navigation";
import { folderStorage } from "@/lib/cores/utils/local";
import { supabase } from "@/lib/cores/utils/supabase";
import { ArrowLeft, History, Inbox, LogOut, MailCheck } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";

type InvitationShellProps = {
  children: ReactNode;
};

function getActiveTab(pathname: string) {
  if (pathname === PageRoutes.invitations) return "inbox";
  if (pathname === PageRoutes.invitationsHistory) return "history";
  return "detail";
}

export default function InvitationShell({ children }: InvitationShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#0f1011] text-[#e8e9ea]">
      <header className="border-b border-[#222426] bg-[#111213] px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-[#f6f7f8]">
              Manage team invitations
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[#7a7d82]">
              Review pending requests, accept or decline access, then check the
              history tab for processed invitations.
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
