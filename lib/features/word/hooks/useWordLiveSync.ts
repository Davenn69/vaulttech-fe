"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/cores/utils/supabase";

export type WordLiveSyncPayload = {
  documentId: string;
  content?: JSONContent;
  fileName?: string;
  sourceUserId: string;
  sourceLabel: string;
  updatedAt: string;
};

export type WordCollaborator = {
  id: string;
  label: string;
  email?: string;
  isSelf: boolean;
  joinedAt?: string;
};

export type WordLiveSyncStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

type WordLiveSyncOptions = {
  onRemoteContent?: (payload: WordLiveSyncPayload) => void;
  onRemoteRename?: (payload: WordLiveSyncPayload) => void;
};

function getUserLabel(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null) {
  const metadata = user?.user_metadata ?? {};
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.display_name,
    user?.email,
  ];

  const nextLabel = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  return nextLabel ?? "Guest";
}

function getPresenceEntries(channel: RealtimeChannel) {
  const state = channel.presenceState() as Record<
    string,
    Array<Record<string, unknown>>
  >;

  return Object.entries(state).flatMap(([presenceId, entries]) =>
    entries.map((entry) => ({
      presenceId,
      entry,
    })),
  );
}

export default function useWordLiveSync(
  documentId?: string,
  options?: WordLiveSyncOptions,
) {
  const [status, setStatus] = useState<WordLiveSyncStatus>("idle");
  const [collaborators, setCollaborators] = useState<WordCollaborator[]>([]);
  const [selfUserId, setSelfUserId] = useState<string | null>(null);
  const [selfLabel, setSelfLabel] = useState<string>("Guest");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const syncCollaborators = useCallback(
    (channel: RealtimeChannel, currentUserId: string) => {
      const entries = getPresenceEntries(channel);
      const nextCollaborators = entries
        .map(({ entry, presenceId }) => {
          const userId =
            typeof entry.userId === "string" ? entry.userId : presenceId;
          const label =
            typeof entry.label === "string" && entry.label.trim()
              ? entry.label
              : "Guest";
          const email =
            typeof entry.email === "string" ? entry.email : undefined;
          const joinedAt =
            typeof entry.joinedAt === "string" ? entry.joinedAt : undefined;

          return {
            id: userId,
            label,
            email,
            joinedAt,
            isSelf: userId === currentUserId,
          } satisfies WordCollaborator;
        })
        .reduce<WordCollaborator[]>((accumulator, item) => {
          if (accumulator.some((existing) => existing.id === item.id)) {
            return accumulator;
          }

          accumulator.push(item);
          return accumulator;
        }, []);

      setCollaborators(nextCollaborators);
    },
    [],
  );

  const publishContentChange = useCallback(
    async (payload: Omit<WordLiveSyncPayload, "updatedAt">) => {
      const channel = channelRef.current;
      if (!channel) return false;

      return channel.send({
        type: "broadcast",
        event: "word-content-update",
        payload: {
          ...payload,
          updatedAt: new Date().toISOString(),
        } satisfies WordLiveSyncPayload,
      });
    },
    [],
  );

  const publishRenameChange = useCallback(
    async (payload: Omit<WordLiveSyncPayload, "updatedAt" | "content">) => {
      const channel = channelRef.current;
      if (!channel) return false;

      return channel.send({
        type: "broadcast",
        event: "word-rename-update",
        payload: {
          ...payload,
          updatedAt: new Date().toISOString(),
        } satisfies WordLiveSyncPayload,
      });
    },
    [],
  );

  useEffect(() => {
    if (!documentId) return;

    let cancelled = false;
    let activeChannel: RealtimeChannel | null = null;

    const connect = async () => {
      setStatus("connecting");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error) {
        setStatus("error");
        return;
      }

      const currentUserId = user?.id ?? `guest-${crypto.randomUUID()}`;
      const currentLabel = getUserLabel(user);
      const currentEmail = user?.email ?? undefined;

      setSelfUserId(currentUserId);
      setSelfLabel(currentLabel);

      const channel = supabase.channel(`word-document:${documentId}`);
      activeChannel = channel;
      channelRef.current = channel;

      channel.on("broadcast", { event: "word-content-update" }, ({ payload }) => {
        const nextPayload = payload as WordLiveSyncPayload | undefined;

        if (!nextPayload || nextPayload.documentId !== documentId) return;
        if (nextPayload.sourceUserId === currentUserId) return;

        optionsRef.current?.onRemoteContent?.(nextPayload);
      });

      channel.on("broadcast", { event: "word-rename-update" }, ({ payload }) => {
        const nextPayload = payload as WordLiveSyncPayload | undefined;

        if (!nextPayload || nextPayload.documentId !== documentId) return;
        if (nextPayload.sourceUserId === currentUserId) return;

        optionsRef.current?.onRemoteRename?.(nextPayload);
      });

      channel.on("presence", { event: "sync" }, () => {
        syncCollaborators(channel, currentUserId);
      });

      channel.subscribe(async (nextStatus) => {
        if (cancelled) return;

        if (nextStatus === "SUBSCRIBED") {
          setStatus("connected");
          await channel.track({
            userId: currentUserId,
            label: currentLabel,
            email: currentEmail,
            joinedAt: new Date().toISOString(),
          });
          syncCollaborators(channel, currentUserId);
          return;
        }

        if (nextStatus === "CHANNEL_ERROR") {
          setStatus("error");
          return;
        }

        if (nextStatus === "TIMED_OUT" || nextStatus === "CLOSED") {
          setStatus("disconnected");
        }
      });
    };

    void connect();

    return () => {
      cancelled = true;
      activeChannel?.unsubscribe();
      channelRef.current = null;
    };
  }, [documentId, syncCollaborators]);

  return {
    status,
    collaborators,
    selfUserId,
    selfLabel,
    publishContentChange,
    publishRenameChange,
  };
}
