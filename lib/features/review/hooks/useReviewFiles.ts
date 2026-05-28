"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import { ReviewFileModel, ReviewModel } from "../types/review_file";

export function useReviewFiles() {
  const [reviewableFiles, setReviewableFiles] = useState<ReviewFileModel[]>([]);
  const [reviewedFiles, setReviewedFiles] = useState<ReviewFileModel[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const fetchReviewFiles = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const res = await api.get<ApiResponse<ReviewModel>>("/review/files");

      setReviewableFiles(res.data.reviewableFiles);
      setReviewedFiles(res.data.reviewedFiles);
    } catch (caughtError) {
      const message = axios.isAxiosError<ApiResponseError>(caughtError)
        ? caughtError.response?.data.message
        : "Failed to fetch review files";

      const nextMessage = message ?? "Failed to fetch review files";
      setError(nextMessage);
      setReviewableFiles([]);
      setReviewedFiles([]);
      console.log(message);
      toast.error(nextMessage);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void fetchReviewFiles();
  }, [fetchReviewFiles]);

  return {
    hydrated,
    loading,
    error,
    reviewableFiles,
    reviewedFiles,
    fetchReviewFiles,
  };
}
