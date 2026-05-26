"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { ReviewerModel } from "../types/reviewer";

export type PermissionType = "read" | "write";

export function useShareUsers(enabled = false) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ReviewerModel[]>([]);
  const [searching, setSearching] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fetchUsers = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    setSearching(true);

    try {
      const res = await api.get<ApiResponse<ReviewerModel[]>>(
        "/invitation/users",
        {
          search: trimmedKeyword || undefined,
        },
      );

      setUsers(res.data ?? []);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch users";

      toast.error(message ?? "Failed to fetch users");
      setUsers([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const timer = window.setTimeout(() => {
      void fetchUsers(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [enabled, fetchUsers, query]);

  const createPermission = useCallback(
    async (
      fileId: string,
      grantedTo: string,
      permissionType: PermissionType,
      folderId?: string,
    ) => {
      setSharing(true);

      try {
        const res = await api.post<ApiResponse<unknown>>("/permission", {
          fileId,
          folderId: folderId ?? "",
          grantedTo,
          permissionType,
        });

        toast.success(res.message);
        return res.data;
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to create permission";

        const nextMessage = message ?? "Failed to create permission";
        toast.error(nextMessage);
        throw error;
      } finally {
        setSharing(false);
      }
    },
    [],
  );

  const clearUsers = useCallback(() => {
    setQuery("");
    setUsers([]);
  }, []);

  return {
    query,
    setQuery,
    users,
    searching,
    sharing,
    clearUsers,
    fetchUsers,
    createPermission,
  };
}
