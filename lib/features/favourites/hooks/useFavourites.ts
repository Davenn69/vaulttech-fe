import { useRouter } from "next/navigation";
import { FileModel } from "../../home/types/file";
import { FolderModel } from "../../home/types/folder";
import { useCallback, useState } from "react";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import toast from "react-hot-toast";

export default function useFavourites() {
  const router = useRouter();

  const [files, setFiles] = useState<FileModel[]>([]);
  const [folders, setFolders] = useState<FolderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFavouriteFiles = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<FileModel[]>>(`/file/favourite`);
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

  const fetchFavouriteFolders = useCallback(async () => {
    setLoading(true);

    try {
      const res =
        await api.get<ApiResponse<FolderModel[]>>(`/folder/favourite`);
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

  return {
    files,
    folders,
    fetchFavouriteFiles,
    fetchFavouriteFolders,
    loading,
  };
}
