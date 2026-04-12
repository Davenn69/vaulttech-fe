import { api } from "@/lib/cores/utils/api";
import { FileModel } from "../types/file";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import axios from "axios";

export function useFileList() {
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

  return {
    files,
    loading,
    fetchFiles,
  };
}
