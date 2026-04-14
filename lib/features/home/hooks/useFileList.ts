import { api } from "@/lib/cores/utils/api";
import { FileModel } from "../types/file";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import axios from "axios";

export function useFileList(onUploadSuccess?: () => void) {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFiles = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<FileModel[]>>(`/file/${id}`);
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

  const renameFile = useCallback(
    async (id: string, name: string) => {
      setLoading(true);

      try {
        const res = await api.patch<ApiResponse<FileModel[]>>(
          `/file/updateName`,
          {
            id: id,
            name: name,
          },
        );

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to update file name";

        toast.error(message ?? "Failed to update file name");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  const deleteFile = useCallback(
    async (id: string) => {
      setLoading(true);

      try {
        const res = await api.delete<ApiResponse<FileModel[]>>(
          `/file/delete/${id}`,
        );

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to delete file";

        toast.error(message ?? "Failed to delete file");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  return {
    files,
    loading,
    fetchFiles,
    renameFile,
    deleteFile,
  };
}
