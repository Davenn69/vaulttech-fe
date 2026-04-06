import { useState, useCallback } from "react";
import { apiClient } from "@/lib/cores/utils/api";
import axios from "axios";

export interface FileUploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function useMultiFileUpload(
  endpoint: string,
  parentFolderId: string,
  onUploadSuccess?: () => void,
) {
  const [files, setFiles] = useState<FileUploadState[]>([]);

  const updateFile = (index: number, patch: Partial<FileUploadState>) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  };

  const uploadByIndices = useCallback(
    async (targetIndices: number[]) => {
      const results = await Promise.all(
        targetIndices.map(async (index) => {
          const targetFile = files[index];
          if (!targetFile) {
            return false;
          }

          const formData = new FormData();
          formData.append("file", targetFile.file);
          formData.append("folderId", parentFolderId);

          updateFile(index, {
            status: "uploading",
            progress: 0,
            error: undefined,
          });

          try {
            await apiClient.post(endpoint, formData, {
              onUploadProgress: (e) => {
                const percent = Math.round((e.loaded * 100) / (e.total ?? 1));
                updateFile(index, { progress: percent });
              },
            });
            updateFile(index, {
              status: "success",
              progress: 100,
              error: undefined,
            });
            return true;
          } catch (error) {
            updateFile(index, {
              status: "error",
              error: axios.isAxiosError(error)
                ? error.message
                : "Failed to upload file",
            });
            return false;
          }
        }),
      );

      if (results.some(Boolean)) {
        onUploadSuccess?.();
      }
    },
    [endpoint, files, onUploadSuccess, parentFolderId],
  );

  const addFiles = useCallback((newFiles: File[]) => {
    const entries: FileUploadState[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const uploadAll = useCallback(async () => {
    const pendingIndices = files
      .map((f, i) => (f.status === "pending" ? i : -1))
      .filter((i) => i !== -1);

    await uploadByIndices(pendingIndices);
  }, [files, uploadByIndices]);

  const addAndUploadFiles = useCallback(
    async (newFiles: File[]) => {
      if (!newFiles.length) {
        return;
      }

      const startIndex = files.length;
      const entries: FileUploadState[] = newFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending",
      }));

      setFiles((prev) => [...prev, ...entries]);

      const results = await Promise.all(
        newFiles.map(async (file, offset) => {
          const index = startIndex + offset;
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folderId", parentFolderId);

          updateFile(index, {
            status: "uploading",
            progress: 0,
            error: undefined,
          });

          try {
            await apiClient.post(endpoint, formData, {
              onUploadProgress: (e) => {
                const percent = Math.round((e.loaded * 100) / (e.total ?? 1));
                updateFile(index, { progress: percent });
              },
            });
            updateFile(index, {
              status: "success",
              progress: 100,
              error: undefined,
            });
            return true;
          } catch (error) {
            updateFile(index, {
              status: "error",
              error: axios.isAxiosError(error)
                ? error.message
                : "Failed to upload file",
            });
            return false;
          }
        }),
      );

      if (results.some(Boolean)) {
        onUploadSuccess?.();
      }
    },
    [endpoint, files.length, onUploadSuccess, parentFolderId],
  );

  const reset = useCallback(() => setFiles([]), []);

  const totalProgress =
    files.length === 0
      ? 0
      : Math.round(
          files.reduce((sum, f) => sum + f.progress, 0) / files.length,
        );

  const allDone =
    files.length > 0 &&
    files.every((f) => f.status === "success" || f.status === "error");

  return {
    files,
    addFiles,
    addAndUploadFiles,
    removeFile,
    uploadAll,
    reset,
    totalProgress,
    allDone,
  };
}
