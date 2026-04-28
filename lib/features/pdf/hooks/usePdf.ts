import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api, apiClient } from "@/lib/cores/utils/api";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { DownloadFileUrl } from "@/lib/features/home/types/file";

export default function usePdf(id?: string) {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [pdfUrl, setPdfUrl] = useState<string>();
  const objectUrlRef = useRef<string>();

  const revokeObjectUrl = useCallback(() => {
    if (!objectUrlRef.current) return;

    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = undefined;
  }, []);

  const fetchPdf = useCallback(async (fileId: string) => {
    setLoading(true);
    setDownloadUrl(undefined);
    setFileName(undefined);
    revokeObjectUrl();
    setPdfUrl(undefined);

    try {
      const res = await api.get<ApiResponse<DownloadFileUrl>>(
        `/file/download/${fileId}`,
      );

      const nextDownloadUrl = res.data.downloadUrl;
      setDownloadUrl(nextDownloadUrl);
      setFileName(res.data.name);

      const pdfResponse = await apiClient.get(nextDownloadUrl, {
        responseType: "blob",
      });
      const blob = pdfResponse.data as Blob;
      const nextObjectUrl = URL.createObjectURL(blob);

      objectUrlRef.current = nextObjectUrl;
      setPdfUrl(nextObjectUrl);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to load PDF";

      toast.error(message ?? "Failed to load PDF");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    void fetchPdf(id);
  }, [fetchPdf, id]);

  useEffect(() => {
    return () => {
      revokeObjectUrl();
    };
  }, [revokeObjectUrl]);

  return {
    loading,
    downloadUrl,
    pdfUrl,
    fileName,
    fetchPdf,
  };
}
