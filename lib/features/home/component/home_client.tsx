"use client";

import Topbar from "@/lib/features/home/component/topbar";
import React, { useEffect, useState } from "react";
import { FileUploader } from "./file_uploader";
import { useMultiFileUpload } from "../hooks/useFileUpload";
import { useParams, usePathname } from "next/navigation";
import {
  UploadRefreshProvider,
  useUploadRefresh,
} from "../context/upload_refresh_context";
import {
  FolderModalProvider,
  useFolderModal,
} from "../context/folder_modal_context";
import Sidebar from "./sidebar";
import { useFolderList } from "../hooks/useFolderList";
import InputModal from "./input_modal";
import { useFileList } from "../hooks/useFileList";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { Clock, FolderOpen, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

function getActiveNav(pathname: string) {
  switch (pathname) {
    case PageRoutes.repositoryRecent:
      return "recent";
    case PageRoutes.repositoryFavourites:
      return "favourites";
    case PageRoutes.repositoryTrash:
      return "trash";
  }

  if (pathname === PageRoutes.repository || /^\/repo\/[^/]+$/.test(pathname)) {
    return "repository";
  }

  return "";
}

function HomeLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const folderId = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const { notifyUploadSuccess, refreshTick } = useUploadRefresh();
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

  const upload = useMultiFileUpload(
    "/file/uploadFile",
    folderId,
    notifyUploadSuccess,
  );
  const { renameFile, fetchFiles, createWordFile } =
    useFileList(notifyUploadSuccess);
  const { uploadFolder, renameFolder, fetchFolders } =
    useFolderList(notifyUploadSuccess);

  const [activeNav, setActiveNav] = useState<string>(() =>
    getActiveNav(pathname),
  );
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const hasActiveUpload = upload.files.some(
    (file) => file.status === "pending" || file.status === "uploading",
  );
  const showUploadedSection = isUploadPanelOpen || hasActiveUpload;

  useEffect(() => {
    if (!folderId) return;
    fetchFiles(folderId);
  }, [fetchFiles, folderId, refreshTick]);

  useEffect(() => {
    if (!folderId) return;
    fetchFolders(folderId);
  }, [fetchFolders, folderId, refreshTick]);

  useEffect(() => {
    setActiveNav(getActiveNav(pathname));
  }, [pathname]);

  const navItems = [
    {
      icon: FolderOpen,
      label: "My Repository",
      id: "repository",
      onTap: async () => {
        const page = await PageRoutes.repositoryRoot();
        await router.push(page);
      },
    },
    {
      icon: Clock,
      label: "Recent",
      id: "recent",
      onTap: async () => {
        await router.push(PageRoutes.repositoryRecent);
      },
    },
    {
      icon: Star,
      label: "Favourites",
      id: "favourites",
      onTap: async () => {
        await router.push(PageRoutes.repositoryFavourites);
      },
    },
    {
      icon: Trash2,
      label: "Trash",
      id: "trash",
      onTap: async () => {
        await router.push(PageRoutes.repositoryTrash);
      },
    },
  ];

  return (
    <div className="flex relative">
      <div className="flex h-screen w-full overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <Sidebar
          navItems={navItems}
          activeItem={activeNav}
          onNavigate={setActiveNav}
          onUploadFiles={upload.addAndUploadFiles}
          onCreateFolder={() => setShowCreateFolder(true)}
          onCreateWordFile={() => createWordFile(folderId)}
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
