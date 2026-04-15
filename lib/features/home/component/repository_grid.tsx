"use client";

import { useFileList } from "@/lib/features/home/hooks/useFileList";
import { useEffect } from "react";
import { useUploadRefresh } from "@/lib/features/home/context/upload_refresh_context";
import { useFolderModal } from "@/lib/features/home/context/folder_modal_context";
import { useFolderList } from "@/lib/features/home/hooks/useFolderList";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import FolderChip from "@/lib/cores/components/folder_chip";
import FileCard from "@/lib/cores/components/file_card";
import { useRouter } from "next/navigation";
import { useCurrentDirectory } from "../context/current_directory_context";
import DirectoryInfo from "./directory_info";

export default function RepositoryGrid({ id }: { id: string }) {
  const { refreshTick, notifyUploadSuccess } = useUploadRefresh();
  const { openUpdateFolderModal, openUpdateFileModal } = useFolderModal();
  const router = useRouter();
  const { pushDirectory } = useCurrentDirectory();

  const {
    files,
    loading: fileLoading,
    fetchFiles,
    deleteFile,
    renameFile,
    addFileToFavourite,
  } = useFileList();
  const {
    folderList,
    loading: folderLoading,
    fetchFolders,
    deleteFolder,
    addFolderToFavourite,
  } = useFolderList(notifyUploadSuccess);

  useEffect(() => {
    if (!id) return;
    fetchFiles(id);
  }, [fetchFiles, id, refreshTick]);

  useEffect(() => {
    if (!id) return;
    fetchFolders(id);
  }, [fetchFolders, id, refreshTick]);

  return (
    <PageWrapper isLoading={fileLoading && folderLoading}>
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-10 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        {/* <DirectoryInfo /> */}

        {/* Folders row */}
        <div className="flex flex-wrap gap-2 mb-5">
          {folderList.map((folder) => (
            <FolderChip
              key={folder.id}
              name={folder.name}
              menuItems={[
                { label: "Open", danger: false, onTap: () => {} },
                {
                  label: "Rename",
                  danger: false,
                  onTap: () => openUpdateFolderModal(folder.id, folder.name),
                },
                {
                  label: "Add to Favourites",
                  danger: false,
                  onTap: () => addFolderToFavourite(folder.id),
                },
                {
                  label: "Move to Trash",
                  danger: true,
                  onTap: () => {
                    deleteFolder(folder.id);
                  },
                },
              ]}
              onTap={() => {
                pushDirectory(folder);
                router.push(`/repo/${folder.id}`);
              }}
            />
          ))}
        </div>

        {/* Files grid */}
        <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
          {files.map((file) => (
            <FileCard
              key={file.id}
              id={file.id}
              name={file.name}
              menuItems={[
                { label: "Open", danger: false, onTap: () => {} },
                {
                  label: "Rename",
                  danger: false,
                  onTap: () => openUpdateFileModal(file.id, file.name),
                },
                {
                  label: "Add to Favourites",
                  danger: false,
                  onTap: () => addFileToFavourite(file.id),
                },
                { label: "Download", danger: false, onTap: () => {} },
                {
                  label: "Delete",
                  danger: true,
                  onTap: () => deleteFile(file.id),
                },
              ]}
              thumbnail={undefined}
            />
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
