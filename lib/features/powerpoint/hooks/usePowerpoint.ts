import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import {
  PowerpointFilePayload,
  PowerpointViewerData,
} from "../types/powerpoint";

const OFFICE_VIEWER_BASE =
  "https://view.officeapps.live.com/op/embed.aspx?src=";

export default function usePowerpoint(id?: string) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>();
  const [downloadUrl, setDownloadUrl] = useState<string>();

  const fetchPowerpoint = useCallback(async (fileId: string) => {
    setLoading(true);
    setFileName(undefined);
    setDownloadUrl(undefined);

    try {
      const res = await api.get<ApiResponse<PowerpointFilePayload>>(
        `/file/download/${fileId}`,
      );

      const nextDownloadUrl = res.data.downloadUrl;
      setDownloadUrl(nextDownloadUrl);
      setFileName(res.data.name);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to load PowerPoint";

      toast.error(message ?? "Failed to load PowerPoint");
    } finally {
      setLoading(false);
    }
  }, []);

  const viewerUrl = useMemo(() => {
    if (!downloadUrl) return undefined;

    return `${OFFICE_VIEWER_BASE}${encodeURIComponent(downloadUrl)}`;
  }, [downloadUrl]);

  const powerpoint: PowerpointViewerData = useMemo(
    () => ({
      fileName,
      downloadUrl,
      viewerUrl,
    }),
    [downloadUrl, fileName, viewerUrl],
  );

  useEffect(() => {
    if (!id) return;

    void fetchPowerpoint(id);
  }, [fetchPowerpoint, id]);

  return {
    loading,
    ...powerpoint,
    fetchPowerpoint,
  };
}
