"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { InvitationAction, InvitationItem } from "../types/invitation";

export function useInvitations() {
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  const getInvitations = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<InvitationItem[]>>("/invitation");

      setInvitations(res.data ?? []);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch invitations";

      toast.error(message ?? "Failed to fetch invitations");
      setInvitations([]);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void getInvitations();
  }, [getInvitations]);

  const pendingInvitations = useMemo(
    () => invitations.filter((item) => item.invitation.status === "pending"),
    [invitations],
  );
  const processedInvitations = useMemo(
    () => invitations.filter((item) => item.invitation.status !== "pending"),
    [invitations],
  );

  const updateInvitationStatus = useCallback(
    async (id: string, action: InvitationAction) => {
      setLoading(true);

      try {
        const endpoint =
          action === "accept" ? `/invitation/accept` : `/invitation/decline`;

        await api.patch<ApiResponse<InvitationItem>>(endpoint, {
          id: id,
        });
        await getInvitations();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : `Failed to ${action} invitation`;

        toast.error(message ?? `Failed to ${action} invitation`);
      } finally {
        setLoading(false);
      }
    },
    [getInvitations],
  );

  return {
    hydrated,
    loading,
    invitations,
    pendingInvitations,
    processedInvitations,
    getInvitations,
    getInvitation: (id: string) =>
      invitations.find((item) => item.invitation.id === id) ?? null,
    acceptInvitation: (id: string) => void updateInvitationStatus(id, "accept"),
    declineInvitation: (id: string) =>
      void updateInvitationStatus(id, "rejected"),
  };
}
