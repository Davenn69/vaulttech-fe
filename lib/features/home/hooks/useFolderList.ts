import axios from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { FolderModel } from "../types/folder";

export function useFolderList(onUploadSuccess?: () => void) {
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

  const uploadFolder = useCallback(
    async (id: string, name: string) => {
      setLoading(true);

      try {
        const res = await api.post<ApiResponse<FolderModel>>("/folder", {
          parentId: id,
          name: name,
        });

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to fetch folders";

        toast.error(message ?? "Failed to fetch folders");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  const deleteFolder = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const res = await api.delete<ApiResponse<FolderModel>>(
        `/folder/delete/${id}`,
      );

      toast.success(res.message);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch folders";

      toast.error(message ?? "Failed to delete folders");
    } finally {
      setLoading(false);
    }
  }, []);

  const renameFolder = useCallback(
    async (id: string, name: string) => {
      setLoading(true);

      try {
        const res = await api.patch<ApiResponse<FolderModel>>(
          `/folder/updateName`,
          {
            id,
            name,
          },
        );

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to rename folder";

        toast.error(message ?? "Failed to rename folder");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  return {
    folderList,
    loading,
    renameFolder,
    uploadFolder,
    fetchFolders,
    deleteFolder,
  };
}
