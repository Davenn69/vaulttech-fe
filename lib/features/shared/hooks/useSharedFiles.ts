"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import { SharedFileModel, SharedFolderModel } from "../types/shared_file";

const SHARED_FILE_ENDPOINTS = ["/file/shared", "/permission/shared"];
const SHARED_FOLDER_ENDPOINTS = ["/folder/shared", "/permission/shared"];
const LAST_SHARED_FILE_ENDPOINT =
  SHARED_FILE_ENDPOINTS[SHARED_FILE_ENDPOINTS.length - 1];
const LAST_SHARED_FOLDER_ENDPOINT =
  SHARED_FOLDER_ENDPOINTS[SHARED_FOLDER_ENDPOINTS.length - 1];

export function useSharedFiles() {
  const [sharedFolders, setSharedFolders] = useState<SharedFolderModel[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFileModel[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const fetchSharedFolders = useCallback(async () => {
    for (const endpoint of SHARED_FOLDER_ENDPOINTS) {
      try {
        const res = await api.get<ApiResponse<SharedFolderModel[]>>(endpoint);

        setSharedFolders(res.data ?? []);
        return;
      } catch (caughtError) {
        if (!axios.isAxiosError(caughtError)) {
          throw caughtError;
        }

        const status = caughtError.response?.status;
        const isMissingEndpoint = status === 404 || status === 405;

        if (!isMissingEndpoint || endpoint === LAST_SHARED_FOLDER_ENDPOINT) {
          setSharedFolders([]);
          return;
        }
      }
    }
  }, []);

  const fetchSharedFiles = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      for (const endpoint of SHARED_FILE_ENDPOINTS) {
        try {
          const res = await api.get<ApiResponse<SharedFileModel[]>>(endpoint);

          setSharedFiles(res.data ?? []);
          return;
        } catch (caughtError) {
          if (!axios.isAxiosError(caughtError)) {
            throw caughtError;
          }

          const status = caughtError.response?.status;
          const isMissingEndpoint = status === 404 || status === 405;

          if (!isMissingEndpoint || endpoint === LAST_SHARED_FILE_ENDPOINT) {
            throw caughtError;
          }
        }
      }
    } catch (caughtError) {
      const message = axios.isAxiosError<ApiResponseError>(caughtError)
        ? caughtError.response?.data.message
        : "Failed to fetch shared files";

      const nextMessage = message ?? "Failed to fetch shared files";
      setError(nextMessage);
      setSharedFiles([]);
      toast.error(nextMessage);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void Promise.all([fetchSharedFolders(), fetchSharedFiles()]);
  }, [fetchSharedFiles, fetchSharedFolders]);

  return {
    hydrated,
    loading,
    error,
    sharedFolders,
    sharedFiles,
    fetchSharedFolders,
    fetchSharedFiles,
  };
}
