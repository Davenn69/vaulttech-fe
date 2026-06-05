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

export function useExcel(id?: string) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ExcelWorkbookContent>();
  const [fileName, setFileName] = useState<string>();
  const [sheetName, setSheetName] = useState<string>("Sheet 1");

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
      setFileName(workbook.file?.name);
      setSheetName(workbook.sheetName ?? "Sheet 1");
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
        const res = await api.post<ApiResponse<ExcelApiPayload>>(
          "/excel/save",
          {
            id: fileId,
            content: nextContent,
          },
        );

        const workbook = res.data;
        setContent(nextContent);
        setFileName(workbook.file?.name);
        setSheetName(workbook.sheetName ?? "Sheet 1");
        return nextContent;
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

  const renameFile = useCallback(async (fileId: string, name: string) => {
    try {
      const res = await api.patch<ApiResponse<{ id: string; name: string }>>(
        `/file/updateName`,
        {
          id: fileId,
          name,
        },
      );

      setFileName(name);
      toast.success(res.message);
      return res.data;
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to update file name";

      toast.error(message ?? "Failed to update file name");
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    void fetchContent(id);
  }, [fetchContent, id]);

  return {
    loading,
    saving,
    content,
    fileName,
    sheetName,
    fetchContent,
    saveContent,
    renameFile,
  };
}
