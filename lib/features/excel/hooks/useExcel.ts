import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ExcelApiPayload,
  apiWorkbookToEditorContent,
  ExcelWorkbookContent,
} from "../types/excel";
import { FileModel } from "../../home/types/file";

export function useExcel(id?: string) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ExcelWorkbookContent>();
  const [file, setFile] = useState<FileModel>();

  const fetchContent = useCallback(async (fileId: string) => {
    setLoading(true);
    setContent(undefined);

    try {
      const res = await api.get<ApiResponse<ExcelApiPayload>>(
        `/excel/${fileId}`,
      );
      const workbook = res.data;
      const nextContent = apiWorkbookToEditorContent(workbook);

      setContent(nextContent);
      setFile(workbook.file);
      return nextContent;
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to get excel content";

      toast.error(message ?? "Failed to get excel content");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveContent = useCallback(
    async (fileId: string, nextContent: ExcelWorkbookContent) => {
      setSaving(true);

      try {
        const res = await api.patch<ApiResponse<ExcelApiPayload>>(
          "/excel/save",
          {
            id: fileId,
            content: nextContent,
          },
        );

        const workbook = res.data;
        const normalized = apiWorkbookToEditorContent(workbook) ?? nextContent;
        setContent(normalized);
        setFile(workbook.file);
        toast.success(res.message);
        return normalized;
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to save excel content";

        toast.error(message ?? "Failed to save excel content");
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!id) return;

    void fetchContent(id);
  }, [fetchContent, id]);

  return {
    loading,
    saving,
    content,
    file,
    fetchContent,
    saveContent,
  };
}
