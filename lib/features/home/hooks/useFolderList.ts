import axios from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { FolderModel } from "../types/folder";

export function useFolderList() {
  const [folderList, setFolderList] = useState<FolderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFolders = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<FolderModel[]>>(`/folder/${id}`);
      setFolderList(res.data);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch folders";

      toast.error(message ?? "Failed to fetch folders");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    folderList,
    loading,
    fetchFolders,
  };
}
