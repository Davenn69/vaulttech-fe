"use client";

import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RecordPageData } from "../types/record";

export default function useRecord(id?: string) {
  const [loading, setLoading] = useState(false);
  const [revertingRevisionId, setRevertingRevisionId] = useState<string>();
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

  const revertRevision = useCallback(
    async (fileId: string, revisionId: string) => {
      setRevertingRevisionId(revisionId);

      try {
        const res = await api.patch<ApiResponse<unknown>>(
          `/revision/${fileId}/revert/${revisionId}`,
        );

        toast.success(res.message);
        await fetchRecord(fileId);
      } catch (caughtError) {
        const message = axios.isAxiosError<ApiResponseError>(caughtError)
          ? caughtError.response?.data.message
          : "Failed to revert revision";

        toast.error(message ?? "Failed to revert revision");
      } finally {
        setRevertingRevisionId(undefined);
      }
    },
    [fetchRecord],
  );

  const downloadRevision = useCallback(
    async (fileId: string, revisionId: string) => {
      try {
        const res = await api.get<
          ApiResponse<{
            file: RecordPageData["file"];
            revision: RecordPageData["revisions"][number];
            downloadUrl: string;
            name: string;
            size?: number;
          }>
        >(`/revision/${fileId}/download/${revisionId}`);

        return res.data;
      } catch (caughtError) {
        const message = axios.isAxiosError<ApiResponseError>(caughtError)
          ? caughtError.response?.data.message
          : "Failed to load revision";

        toast.error(message ?? "Failed to load revision");
        throw caughtError;
      }
    },
    [],
  );

  useEffect(() => {
    if (!id) return;

    void fetchRecord(id);
  }, [fetchRecord, id]);

  return {
    loading,
    revertingRevisionId,
    record,
    error,
    fetchRecord,
    revertRevision,
    downloadRevision,
  };
}
