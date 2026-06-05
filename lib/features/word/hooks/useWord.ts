import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { JSONContent } from "@tiptap/react";
import { FileModel } from "../../home/types/file";
import {
  WordCollaborationDocument,
  WordCollaborationResponse,
  WordFileResponse,
  WordJoinCollaborationResponse,
  WordSyncCollaborationResponse,
} from "../types/word";

type JoinCollaborationOptions = {
  connectionId?: string;
  cursorState?: unknown;
  selectionState?: unknown;
};

type FetchCollaborationOptions = {
  silent?: boolean;
};

function createConnectionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `word-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function useWord(id?: string) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collaborationLoading, setCollaborationLoading] = useState(false);
  const [content, setContent] = useState<JSONContent>();
  const [fileName, setFileName] = useState<string>();
  const [collaboration, setCollaboration] =
    useState<WordCollaborationDocument | null>(null);
  const [connectionId] = useState(createConnectionId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const applyFilePayload = useCallback((data: WordFileResponse) => {
    setContent(data.content);
    setFileName(data.file.name);
    setCollaboration(data.collaboration);
  }, []);

  const fetchContent = useCallback(
    async (fileId: string) => {
      setLoading(true);

      try {
        const res = await api.get<ApiResponse<WordFileResponse>>(
          `/word/${fileId}`,
        );
        applyFilePayload(res.data);
        return res.data;
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to get content";

        toast.error(message ?? "Failed to get content");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [applyFilePayload],
  );

  const fetchCollaboration = useCallback(
    async (fileId: string, options?: FetchCollaborationOptions) => {
      if (!options?.silent) {
        setCollaborationLoading(true);
      }

      try {
        const res = await api.get<ApiResponse<WordCollaborationResponse>>(
          `/word/${fileId}/collaboration`,
        );
        setFileName(res.data.file.name);
        setCollaboration(res.data.collaboration);
        setContent(res.data.collaboration.document);
        return res.data;
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to get collaboration state";

        toast.error(message ?? "Failed to get collaboration state");
        throw error;
      } finally {
        if (!options?.silent) {
          setCollaborationLoading(false);
        }
      }
    },
    [],
  );

  const joinCollaboration = useCallback(
    async (fileId: string, options?: JoinCollaborationOptions) => {
      setCollaborationLoading(true);

      try {
        const res = await api.post<ApiResponse<WordJoinCollaborationResponse>>(
          `/word/${fileId}/collaboration/join`,
          {
            connectionId: options?.connectionId ?? connectionId,
            cursorState: options?.cursorState,
            selectionState: options?.selectionState,
          },
        );

        setFileName(res.data.file.name);
        setSessionId(res.data.session.id);
        if (res.data.collaboration) {
          setCollaboration(res.data.collaboration);
          setContent(res.data.collaboration.document);
        }

        return res.data;
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to join collaboration";

        toast.error(message ?? "Failed to join collaboration");
        throw error;
      } finally {
        setCollaborationLoading(false);
      }
    },
    [connectionId],
  );

  const syncCollaboration = useCallback(
    async (
      fileId: string,
      nextContent: JSONContent,
      versionNumber?: number,
    ) => {
      try {
        const res = await api.patch<ApiResponse<WordSyncCollaborationResponse>>(
          `/word/${fileId}/collaboration/sync`,
          {
            content: nextContent,
            versionNumber,
          },
        );

        setContent(nextContent);
        setFileName(res.data.file.name);
        setCollaboration(res.data.collaboration);
        return res.data;
      } catch (error) {
        const message = axios.isAxiosError<ApiResponseError>(error)
          ? error.response?.data.message
          : "Failed to sync collaboration";

        toast.error(message ?? "Failed to sync collaboration");
        throw error;
      }
    },
    [],
  );

  const saveContent = useCallback(
    async (fileId: string, nextContent: JSONContent) => {
      setSaving(true);

      try {
        const res = await api.patch<
          ApiResponse<{
            file: FileModel;
            revision?: unknown;
            collaboration?: {
              versionNumber: number;
            };
          }>
        >("/word/save", {
          id: fileId,
          content: nextContent,
        });

        setContent(nextContent);
        setFileName(res.data.file.name);

        if (res.data.collaboration) {
          setCollaboration((current) =>
            current
              ? {
                  ...current,
                  versionNumber: res.data.collaboration!.versionNumber,
                }
              : {
                  document: nextContent,
                  versionNumber: res.data.collaboration!.versionNumber,
                },
          );
        }

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

  const renameFile = useCallback(async (fileId: string, name: string) => {
    try {
      const res = await api.patch<ApiResponse<FileModel[]>>(
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
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const bootstrap = async () => {
      setLoading(true);

      try {
        await fetchContent(id);
        if (cancelled) return;

        await joinCollaboration(id);
      } catch {
        // fetchContent and joinCollaboration already surface toasts.
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [fetchContent, id, joinCollaboration]);

  return {
    loading,
    saving,
    collaborationLoading,
    content,
    fileName,
    collaboration,
    connectionId,
    sessionId,
    fetchContent,
    fetchCollaboration,
    joinCollaboration,
    syncCollaboration,
    saveContent,
    renameFile,
  };
}
