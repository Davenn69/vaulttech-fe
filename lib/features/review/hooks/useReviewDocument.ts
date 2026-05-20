"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import useRecord from "@/lib/features/record/hooks/useRecord";
import { ReviewDetailModel } from "../types/review_file";

const ACCEPT_REVIEW_ENDPOINT = "/review/accept";

export function useReviewDocument(id?: string) {
  const recordState = useRecord(id);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewDetail, setReviewDetail] = useState<ReviewDetailModel>();
  const [error, setError] = useState<string>();

  const fetchUrl = useCallback(async (fileId?: string) => {
    if (!fileId) return;

    setLoading(true);
    setError(undefined);

    try {
      const res = await api.get<ApiResponse<ReviewDetailModel>>(
        `/file/${fileId}/signedUrl`,
      );

      setReviewDetail(res.data);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to load review document";

      const nextMessage = message ?? "Failed to load review document";
      setError(nextMessage);
      toast.error(nextMessage);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    void fetchUrl(id);
  }, [fetchUrl, id]);

  const acceptDocument = useCallback(async (fileId: string) => {
    setAccepting(true);

    try {
      const res = await api.patch<ApiResponse<unknown>>(
        ACCEPT_REVIEW_ENDPOINT,
        {
          id: fileId,
        },
      );

      toast.success(res.message);
      return res.data;
    } catch (caughtError) {
      const message = axios.isAxiosError<ApiResponseError>(caughtError)
        ? caughtError.response?.data.message
        : "Failed to accept document";

      const nextMessage = message ?? "Failed to accept document";
      toast.error(nextMessage);
      throw caughtError;
    } finally {
      setAccepting(false);
    }
  }, []);

  return {
    ...recordState,
    loading: recordState.loading || loading,
    error: recordState.error ?? error,
    reviewDetail,
    signedUrl: reviewDetail?.signedUrl,
    fetchUrl,
    accepting,
    acceptDocument,
  };
}
