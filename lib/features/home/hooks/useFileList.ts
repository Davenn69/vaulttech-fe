import { api } from "@/lib/cores/utils/api";
import { FileModel } from "../types/file";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiResponse } from "@/lib/cores/types/api_response";

export function useFileList(id: string) {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFiles = async (id: string) => {
    setLoading(true);

    try {
      const res = await api.get<ApiResponse<FileModel[]>>(`/file/${id}`);
      setFiles(res.data);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    fetchFiles(id);
  }, []);

  return {
    files,
    loading,
    fetchFiles,
  };
}
