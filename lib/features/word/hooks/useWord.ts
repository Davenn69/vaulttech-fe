import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { JSONContent } from "@tiptap/react";
import { WordContent } from "../types/word";
import { FileModel } from "../../home/types/file";

export default function useWord(id?: string) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<JSONContent>();
  const [fileName, setFileName] = useState<string>();

  const fetchContent = useCallback(async (id: string) => {
    setLoading(true);
    setContent(undefined);
    try {
      const res = await api.get<ApiResponse<WordContent>>(`/word/${id}`);
      setContent(res.data.content);
      setFileName(res.data.file.name);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to get content";

      toast.error(message ?? "Failed to get content");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveContent = useCallback(
    async (id: string, nextContent: JSONContent) => {
      setSaving(true);
      try {
        const res = await api.patch<ApiResponse<WordContent>>("/word/save", {
          id,
          content: nextContent,
        });
        setContent(nextContent);
        return res.data;
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to save content";

        toast.error(message ?? "Failed to save content");
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const renameFile = useCallback(async (id: string, name: string) => {
    try {
      const res = await api.patch<ApiResponse<FileModel[]>>(
        `/file/updateName`,
        {
          id,
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
    fetchContent,
    saveContent,
    renameFile,
  };
}
