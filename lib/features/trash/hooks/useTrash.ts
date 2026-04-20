import { useCallback, useState } from "react";
import { FileModel } from "../../home/types/file";
import { FolderModel } from "../../home/types/folder";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import toast from "react-hot-toast";
import { error } from "console";

export function useTrash() {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [folders, setFolders] = useState<FolderModel[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const fetchDeletedFiles = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<FileModel[]>>(`/file/deleted`);
      setFiles(res.data);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch files";

      toast.error(message ?? "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeletedFolders = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<FolderModel[]>>(`/folder/deleted`);
      setFolders(res.data);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch folders";

      toast.error(message ?? "Failed to fetch folders");
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreFile = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const res = await api.patch<ApiResponse<FileModel>>(`/file/restore`, {
        id,
      });

      toast.success(res.message);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to restore file";

      toast.error(message ?? "Failed to restore file");
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreFolder = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const res = await api.patch<ApiResponse<FolderModel>>(`/folder/restore`, {
        id,
      });

      toast.success(res.message);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to restore folder";

      toast.error(message ?? "Failed to restore folder");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    files,
    folders,
    fetchDeletedFiles,
    restoreFile,
    fetchDeletedFolders,
    restoreFolder,
    loading,
  };
}
