import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { CategorizedFile, CategoryModel } from "../types/category";
import { FileModel } from "../../home/types/file";

type AssignFileCategoryPayload = {
  id: string;
  categoryId: string;
  color: string;
};

export function useCategories(onSuccess?: () => void) {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [files, setFiles] = useState<CategorizedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<CategoryModel[]>>("/category");
      setCategories(res.data);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch categories";

      toast.error(message ?? "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const assignFileCategory = useCallback(
    async (payload: AssignFileCategoryPayload) => {
      setLoading(true);

      try {
        const res = await api.patch<ApiResponse<unknown>>(
          "/file/addCategory",
          payload,
        );

        toast.success(res.message);
        onSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to update file category";

        toast.error(message ?? "Failed to update file category");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  const removeCategoryFromFile = useCallback(
    async (id: string) => {
      setLoading(true);

      try {
        const res = await api.patch<ApiResponse<unknown>>(
          "/file/removeCategory",
          {
            id,
          },
        );

        toast.success(res.message);
        onSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to remove file category";

        toast.error(message ?? "Failed to remove file category");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  const createCategory = useCallback(
    async (payload: { name: string; color: string }) => {
      setLoading(true);

      try {
        const res = await api.post<ApiResponse<CategoryModel>>("/category", {
          name: payload.name,
          color: payload.color,
        });

        toast.success(res.message);
        await fetchCategories();
        onSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to create category";

        toast.error(message ?? "Failed to create category");
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories, onSuccess],
  );

  const fetchFilesByCategories = useCallback(async () => {
    setLoading(true);

    try {
      const res =
        await api.get<ApiResponse<Record<string, FileModel[]>>>(
          "/category/grouped",
        );

      const mappedFiles = Object.entries(res.data).map(
        ([name, groupedItems]) => ({
          name,
          file: groupedItems,
        }),
      );
      setFiles(mappedFiles);
      toast.success(res.message);
      await fetchCategories();
      onSuccess?.();
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to fetch files";

      toast.error(message ?? "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, onSuccess]);

  return {
    categories,
    loading,
    files,
    fetchCategories,
    assignFileCategory,
    removeCategoryFromFile,
    createCategory,
    fetchFilesByCategories,
  };
}
