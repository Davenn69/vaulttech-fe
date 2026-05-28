"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { ReviewerModel } from "../types/reviewer";

export function useReviewers(enabled = false) {
  const [query, setQuery] = useState("");
  const [reviewers, setReviewers] = useState<ReviewerModel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviewers = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<ReviewerModel[]>>(
        "/invitation/users",
        {
          search: trimmedKeyword || undefined,
        },
      );

      setReviewers(res.data ?? []);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch reviewers";

      toast.error(message ?? "Failed to fetch reviewers");
      setReviewers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendInvite = useCallback(async (userId: string, fileId: string) => {
    setLoading(true);

    try {
      const res = await api.post<ApiResponse<ReviewerModel>>("/invitation", {
        fileId: fileId,
        supervisorId: userId,
      });

      toast.success(res.message);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to send invite";

      toast.error(message ?? "Failed to send invite");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const timer = window.setTimeout(() => {
      fetchReviewers(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [enabled, fetchReviewers, query]);

  const clearReviewers = useCallback(() => {
    setQuery("");
    setReviewers([]);
  }, []);

  const refreshReviewers = useCallback(() => {
    if (!enabled) return;
    void fetchReviewers(query);
  }, [enabled, fetchReviewers, query]);

  return {
    query,
    setQuery,
    reviewers,
    loading,
    clearReviewers,
    refreshReviewers,
    sendInvite,
  };
}
