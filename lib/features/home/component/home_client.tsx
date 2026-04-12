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
import Sidebar from "./sidebar";
import CreateFolderModal from "./create_folder_modal";
import { useFolderList } from "../hooks/useFolderList";

function HomeLayoutContent({ children }: { children: React.ReactNode }) {
  const { notifyUploadSuccess } = useUploadRefresh();
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
  const { uploadFolder } = useFolderList();
  const hasActiveUpload = upload.files.some(
    (file) => file.status === "pending" || file.status === "uploading",
  );
  const showUploadedSection = isUploadPanelOpen || hasActiveUpload;

  return (
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
      <CreateFolderModal
        open={showCreateFolder}
        onClose={function (): void {
          setShowCreateFolder(false);
        }}
        onSubmit={async function (folderName: string): Promise<void> {
          await uploadFolder(folderId, folderName);
          setShowCreateFolder(false);
        }}
      />
    </div>
  );
}

export default function HomeLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UploadRefreshProvider>
      <HomeLayoutContent>{children}</HomeLayoutContent>
    </UploadRefreshProvider>
  );
}
