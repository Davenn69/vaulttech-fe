"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import { ReviewCommentsModel } from "../types/review_file";

export function useReviewComments(reviewInvitationId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [reviewComments, setReviewComments] = useState<ReviewCommentsModel>();

  const fetchComments = useCallback(async (fileId?: string) => {
    if (!fileId) return;

    setLoading(true);
    setError(undefined);

    try {
      const res = await api.get<ApiResponse<ReviewCommentsModel>>(
        `/review/files/${fileId}/comments`,
      );

      setReviewComments(res.data);
    } catch (caughtError) {
      const message = axios.isAxiosError<ApiResponseError>(caughtError)
        ? caughtError.response?.data.message
        : "Failed to load supervisor comments";

      const nextMessage = message ?? "Failed to load supervisor comments";
      setError(nextMessage);
      setReviewComments(undefined);
      toast.error(nextMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!reviewInvitationId) return;

    void fetchComments(reviewInvitationId);
  }, [fetchComments, reviewInvitationId]);

  return {
    loading,
    error,
    reviewComments,
    comments: reviewComments?.comments ?? [],
    fetchComments,
  };
}
