"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import useRecord from "@/lib/features/record/hooks/useRecord";

const ACCEPT_REVIEW_ENDPOINT = "/review/accept";

export function useReviewDocument(id?: string) {
  const recordState = useRecord(id);
  const [accepting, setAccepting] = useState(false);

  const acceptDocument = useCallback(async (fileId: string) => {
    setAccepting(true);

    try {
      const res = await api.patch<ApiResponse<unknown>>(ACCEPT_REVIEW_ENDPOINT, {
        id: fileId,
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

  return {
    ...recordState,
    accepting,
    acceptDocument,
  };
}
