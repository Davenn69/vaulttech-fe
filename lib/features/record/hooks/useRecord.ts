"use client";

import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RecordPageData } from "../types/record";

export default function useRecord(id?: string) {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<RecordPageData>();
  const [error, setError] = useState<string>();

  const fetchRecord = useCallback(async (fileId: string) => {
    setLoading(true);
    setError(undefined);
    setRecord(undefined);

    try {
      const res = await api.get<ApiResponse<RecordPageData>>(
        `/revision/${fileId}`,
      );

      console.log("hello");

      setRecord(res.data);
      document.title = `${res.data.file.name} - Record`;
    } catch (caughtError) {
      const message = axios.isAxiosError<ApiResponseError>(caughtError)
        ? caughtError.response?.data.message
        : "Failed to fetch record";

      const nextMessage = message ?? "Failed to fetch record";
      setError(nextMessage);
      toast.error(nextMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    void fetchRecord(id);
  }, [fetchRecord, id]);

  return {
    loading,
    record,
    error,
    fetchRecord,
  };
}
