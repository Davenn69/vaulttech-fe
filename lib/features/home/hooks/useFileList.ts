import { api } from "@/lib/cores/utils/api";
import { DownloadFileUrl, FileModel } from "../types/file";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import axios from "axios";
import { useRouter } from "next/navigation";
import { PageRoutes } from "@/lib/cores/utils/navigation";

export function useFileList(onUploadSuccess?: () => void) {
  const router = useRouter();
  const [files, setFiles] = useState<FileModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFiles = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<FileModel[]>>(`/file/${id}`);
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

  const renameFile = useCallback(
    async (id: string, name: string) => {
      setLoading(true);

      try {
        const res = await api.patch<ApiResponse<FileModel[]>>(
          `/file/updateName`,
          {
            id: id,
            name: name,
          },
        );

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to update file name";

        toast.error(message ?? "Failed to update file name");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  const deleteFile = useCallback(
    async (id: string) => {
      setLoading(true);

      try {
        const res = await api.delete<ApiResponse<FileModel[]>>(
          `/file/delete/${id}`,
        );

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to delete file";

        toast.error(message ?? "Failed to delete file");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  const addFileToFavourite = useCallback(
    async (id: string) => {
      setLoading(true);

      try {
        const res = await api.patch<ApiResponse<FileModel>>(
          `/file/addFavourite`,
          { id },
        );

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to add to favourites";

        toast.error(message ?? "Failed to add to favourites");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  const removeFileFromFavourites = useCallback(
    async (id: string) => {
      setLoading(true);

      try {
        const res = await api.patch<ApiResponse<FileModel>>(
          `/file/removeFavourite`,
          { id },
        );

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to add to favourites";

        toast.error(message ?? "Failed to add to favourites");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  const downloadFile = useCallback(
    async (id: string) => {
      try {
        const res = await api.get<ApiResponse<DownloadFileUrl>>(
          `/file/download/${id}`,
        );

        const { downloadUrl, name } = res.data;

        if (!downloadUrl) {
          throw new Error("Missing download url");
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = name || "download";
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success(res.message);
        onUploadSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to download file";

        toast.error(message ?? "Failed to download file");
      }
    },
    [onUploadSuccess],
  );

  const createWordFile = useCallback(
    async (id: string) => {
      setLoading(true);

      try {
        const res = await api.post<ApiResponse<FileModel>>(`/word/create`, {
          folderId: id,
        });

        toast.success(res.message);
        onUploadSuccess?.();

        router.push(PageRoutes.wordFile(res.data.id));
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to add to favourites";

        toast.error(message ?? "Failed to add to favourites");
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess],
  );

  return {
    files,
    loading,
    fetchFiles,
    renameFile,
    addFileToFavourite,
    removeFileFromFavourites,
    deleteFile,
    downloadFile,
    createWordFile,
  };
}
