"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import { ReviewDetailModel } from "../types/review_file";

export function useReviewDocument(fileId?: string) {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [reviewDetail, setReviewDetail] = useState<ReviewDetailModel>();

  const fetchUrl = useCallback(async (currentFileId?: string) => {
    if (!currentFileId) return;

    setPreviewLoading(true);

    try {
      const res = await api.get<ApiResponse<ReviewDetailModel>>(
        `/file/${currentFileId}/signedUrl`,
      );

      setReviewDetail(res.data);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to load review document";

      const nextMessage = message ?? "Failed to load review document";
      toast.error(nextMessage);
      return undefined;
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fileId) return;

    void fetchUrl(fileId);
  }, [fetchUrl, fileId]);

  const acceptDocument = useCallback(async (documentSupervisorId: string) => {
    setAccepting(true);

    try {
      const res = await api.patch<ApiResponse<unknown>>("/review/approve", {
        id: documentSupervisorId,
      });

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

  const declineDocument = useCallback(
    async (documentSupervisorId: string, comment: string) => {
      setDeclining(true);

      try {
        const res = await api.patch<ApiResponse<unknown>>("/review/decline", {
          id: documentSupervisorId,
          comment,
        });

        toast.success(res.message);
        return res.data;
      } catch (caughtError) {
        const message = axios.isAxiosError<ApiResponseError>(caughtError)
          ? caughtError.response?.data.message
          : "Failed to decline document";

        const nextMessage = message ?? "Failed to decline document";
        toast.error(nextMessage);
        throw caughtError;
      } finally {
        setDeclining(false);
      }
    },
    [],
  );

  return {
    previewLoading,
    reviewDetail,
    signedUrl: reviewDetail?.url,
    fetchUrl,
    accepting,
    acceptDocument,
    declining,
    declineDocument,
  };
}
