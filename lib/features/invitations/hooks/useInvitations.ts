"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  InvitationAction,
  InvitationItem,
  InvitationStatus,
} from "../types/invitation";

const STORAGE_KEY = "vaulttech-invitations";
const STORAGE_EVENT = "vaulttech-invitations-changed";

const initialInvitations: InvitationItem[] = [
  {
    id: "inv-001",
    teamName: "Design System Team",
    inviterName: "Ayu Pratama",
    role: "Editor",
    repositoryName: "VaultTech Design Library",
    message:
      "Kami ingin kamu ikut mengelola komponen UI dan menjaga konsistensi visual.",
    sentAt: "2026-05-18T08:12:00.000Z",
    status: "pending",
  },
  {
    id: "inv-002",
    teamName: "Platform Engineering",
    inviterName: "Rafi Maulana",
    role: "Viewer",
    repositoryName: "VaultTech Platform Docs",
    message:
      "Silakan review dokumentasi arsitektur dan update catatan integrasi.",
    sentAt: "2026-05-17T14:40:00.000Z",
    status: "pending",
  },
  {
    id: "inv-003",
    teamName: "Growth Squad",
    inviterName: "Nadia Siregar",
    role: "Maintainer",
    repositoryName: "VaultTech Campaign Assets",
    message:
      "Repositori ini dipakai untuk aset kampanye dan butuh approval cepat.",
    sentAt: "2026-05-15T10:05:00.000Z",
    status: "accepted",
    decidedAt: "2026-05-15T12:30:00.000Z",
  },
];

function loadInvitations(): InvitationItem[] {
  if (typeof window === "undefined") return initialInvitations;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return initialInvitations;

  try {
    const parsed = JSON.parse(stored) as InvitationItem[];
    return parsed.length ? parsed : initialInvitations;
  } catch {
    return initialInvitations;
  }
}

export function useInvitations() {
  const invitations = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => undefined;

      window.addEventListener(STORAGE_EVENT, callback);
      window.addEventListener("storage", callback);

      return () => {
        window.removeEventListener(STORAGE_EVENT, callback);
        window.removeEventListener("storage", callback);
      };
    },
    loadInvitations,
    () => initialInvitations,
  );

  const pendingInvitations = useMemo(
    () => invitations.filter((item) => item.status === "pending"),
    [invitations],
  );
  const processedInvitations = useMemo(
    () => invitations.filter((item) => item.status !== "pending"),
    [invitations],
  );

  const updateInvitationStatus = (id: string, action: InvitationAction) => {
    const nextInvitations = loadInvitations().map((item) => {
      if (item.id !== id || item.status !== "pending") return item;

      const status: InvitationStatus =
        action === "accept" ? "accepted" : "declined";

      return {
        ...item,
        status,
        decidedAt: new Date().toISOString(),
      };
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextInvitations));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    }
  };

  return {
    hydrated: typeof window !== "undefined",
    invitations,
    pendingInvitations,
    processedInvitations,
    getInvitation: (id: string) => invitations.find((item) => item.id === id) ?? null,
    acceptInvitation: (id: string) => updateInvitationStatus(id, "accept"),
    declineInvitation: (id: string) => updateInvitationStatus(id, "decline"),
  };
}
