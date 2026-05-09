"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type RenameFileFn = (fileId: string, name: string) => Promise<unknown>;

type UsePdfFileNameEditorParams = {
  id?: string;
  fileName?: string;
  renameFile: RenameFileFn;
};

export default function usePdfFileNameEditor({
  id,
  fileName,
  renameFile,
}: UsePdfFileNameEditorParams) {
  const [documentName, setDocumentName] = useState("PDF document");
  const [isEditingName, setIsEditingName] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const previousNameRef = useRef("PDF document");
  const activeDocumentName = fileName ?? documentName;

  useEffect(() => {
    if (!fileName) return;

    setDocumentName(fileName);
    previousNameRef.current = fileName;
    document.title = `${fileName} - PDF viewer`;
  }, [fileName]);

  useEffect(() => {
    if (!isEditingName) return;

    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [isEditingName]);

  const beginRename = useCallback(() => {
    previousNameRef.current = activeDocumentName;
    setIsEditingName(true);
  }, [activeDocumentName]);

  const cancelRename = useCallback(() => {
    setDocumentName(previousNameRef.current);
    setIsEditingName(false);
  }, []);

  const renameCurrentFile = useCallback(
    async (nextName: string) => {
      if (!id || renaming) return;

      const trimmedName = nextName.trim();

      if (!trimmedName) {
        toast.error("Nama file tidak boleh kosong");
        return;
      }

      setRenaming(true);

      try {
        await renameFile(id, trimmedName);
        setDocumentName(trimmedName);
        previousNameRef.current = trimmedName;
        document.title = `${trimmedName} - PDF viewer`;
      } finally {
        setRenaming(false);
      }
    },
    [id, renameFile, renaming],
  );

  const submitRename = useCallback(async () => {
    setIsEditingName(false);

    if (documentName === previousNameRef.current) return;

    await renameCurrentFile(documentName);
  }, [documentName, renameCurrentFile]);

  return {
    activeDocumentName,
    cancelRename,
    documentName,
    isEditingName,
    nameInputRef,
    renaming,
    setDocumentName,
    beginRename,
    submitRename,
  };
}
