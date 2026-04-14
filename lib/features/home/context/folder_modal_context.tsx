"use client";

import { createContext, useContext, useState } from "react";

type FolderModalContextValue = {
  openUpdateFolderModal: (folderId: string, folderName: string) => void;
  closeUpdateFolderModal: () => void;
  isUpdateFolderOpen: boolean;
  selectedFolderId: string;
  selectedFolderName: string;
  openUpdateFileModal: (fileId: string, fileName: string) => void;
  closeUpdateFileModal: () => void;
  isUpdateFileOpen: boolean;
  selectedFileId: string;
  selectedFileName: string;
};

const FolderModalContext = createContext<FolderModalContextValue | null>(null);

export function FolderModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUpdateFolderOpen, setIsUpdateFolderOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedFolderName, setSelectedFolderName] = useState("");

  const [isUpdateFileOpen, setIsUpdateFileOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const openUpdateFolderModal = (folderId: string, folderName: string) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    setIsUpdateFolderOpen(true);
  };

  const closeUpdateFolderModal = () => {
    setIsUpdateFolderOpen(false);
    setSelectedFolderId("");
    setSelectedFolderName("");
  };

  const openUpdateFileModal = (fileId: string, fileName: string) => {
    setSelectedFileId(fileId);
    setSelectedFileName(fileName);
    setIsUpdateFileOpen(true);
  };

  const closeUpdateFileModal = () => {
    setIsUpdateFileOpen(false);
    setSelectedFileId("");
    setSelectedFileName("");
  };

  return (
    <FolderModalContext.Provider
      value={{
        openUpdateFolderModal,
        closeUpdateFolderModal,
        isUpdateFolderOpen,
        selectedFolderId,
        selectedFolderName,
        openUpdateFileModal,
        closeUpdateFileModal,
        isUpdateFileOpen,
        selectedFileId,
        selectedFileName,
      }}
    >
      {children}
    </FolderModalContext.Provider>
  );
}

export function useFolderModal() {
  const context = useContext(FolderModalContext);

  if (!context) {
    throw new Error("useFolderModal must be used inside FolderModalProvider");
  }

  return context;
}
