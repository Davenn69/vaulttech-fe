import { useCallback, useState } from "react";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import axios from "axios";
import toast from "react-hot-toast";
import {
  RecentData,
  RecentFileItem,
  RecentFolderItem,
} from "../types/recentData";

export default function useRecent() {
  const [recent, setRecent] = useState<RecentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRecent = useCallback(async () => {
    setLoading(true);

    try {
      const res =
        await api.get<
          ApiResponse<
            Record<
              string,
              { file: RecentFileItem[]; folder: RecentFolderItem[] }
            >
          >
        >(`/recent`);

      const mappedRecent = Object.entries(res.data)
        .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
        .map(([date, groupedItems]) => ({
          date,
          file: groupedItems.file,
          folder: groupedItems.folder,
        }));

      setRecent(mappedRecent);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch data";

      toast.error(message ?? "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recent,
    loading,
    fetchRecent,
  };
}
