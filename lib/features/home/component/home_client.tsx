"use client";

import Topbar from "@/lib/features/home/component/topbar";
import React, { useState } from "react";
import { FileUploader } from "./file_uploader";
import { useMultiFileUpload } from "../hooks/useFileUpload";
import { useParams } from "next/navigation";
import {
  UploadRefreshProvider,
  useUploadRefresh,
} from "../context/upload_refresh_context";
import { CurrentDirectoryProvider } from "../context/current_directory_context";
import {
  FolderModalProvider,
  useFolderModal,
} from "../context/folder_modal_context";
import Sidebar from "./sidebar";
import { useFolderList } from "../hooks/useFolderList";
import InputModal from "./input_modal";
import { useFileList } from "../hooks/useFileList";

function HomeLayoutContent({ children }: { children: React.ReactNode }) {
  const { notifyUploadSuccess } = useUploadRefresh();
  const {
    closeUpdateFolderModal,
    isUpdateFolderOpen,
    selectedFolderId,
    selectedFolderName,
    closeUpdateFileModal,
    isUpdateFileOpen,
    selectedFileId,
    selectedFileName,
  } = useFolderModal();
  const params = useParams();
  const folderId = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const [activeNav, setActiveNav] = useState("repository");
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const upload = useMultiFileUpload(
    "/file/uploadFile",
    folderId,
    notifyUploadSuccess,
  );
  const { renameFile } = useFileList();
  const { uploadFolder, renameFolder } = useFolderList();

  const hasActiveUpload = upload.files.some(
    (file) => file.status === "pending" || file.status === "uploading",
  );
  const showUploadedSection = isUploadPanelOpen || hasActiveUpload;

  return (
    <CurrentDirectoryProvider>
      <div className="flex relative">
        <div className="flex h-screen w-full overflow-hidden bg-[#111213] text-[#e8e9ea]">
          <Sidebar
            activeItem={activeNav}
            onNavigate={setActiveNav}
            onUploadFiles={upload.addAndUploadFiles}
            onCreateFolder={() => setShowCreateFolder(true)}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar
              onUploadToggle={() =>
                setIsUploadPanelOpen((prevState) => !prevState)
              }
            />
            {children}
          </div>
        </div>
        <FileUploader
          showSection={showUploadedSection}
          files={upload.files}
          totalProgress={upload.totalProgress}
        />

        {/* Create Folder Modal */}
        <InputModal
          open={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onSubmit={async function (folderName: string): Promise<void> {
            await uploadFolder(folderId, folderName);
            setShowCreateFolder(false);
          }}
        />

        {/* Update Folder Modal */}
        <InputModal
          open={isUpdateFolderOpen}
          initialValue={selectedFolderName}
          onClose={closeUpdateFolderModal}
          onSubmit={async (folderName) => {
            await renameFolder(selectedFolderId, folderName);
            closeUpdateFolderModal();
          }}
        />

        {/* Update File Modal */}
        <InputModal
          open={isUpdateFileOpen}
          initialValue={selectedFileName}
          onClose={closeUpdateFileModal}
          onSubmit={async (fileName) => {
            await renameFile(selectedFileId, fileName);
            closeUpdateFileModal();
          }}
        />
      </div>
    </CurrentDirectoryProvider>
  );
}

export default function HomeLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UploadRefreshProvider>
      <FolderModalProvider>
        <HomeLayoutContent>{children}</HomeLayoutContent>
      </FolderModalProvider>
    </UploadRefreshProvider>
  );
}
