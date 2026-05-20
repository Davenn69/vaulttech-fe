import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { api, apiClient } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { DownloadFileUrl } from "../types/file";
import { PhotoModel } from "../types/photo";

export default function usePhotoViewer(id: string) {
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<PhotoModel>();

  const fetchUrl = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<PhotoModel>>(`/file/${id}/photo`);

      setPhoto(res.data);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to load image";

      toast.error(message ?? "Failed to load image");
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    void fetchUrl();
  }, [fetchUrl]);

  return {
    loading,
    fetchUrl,
    photo,
  };
}
