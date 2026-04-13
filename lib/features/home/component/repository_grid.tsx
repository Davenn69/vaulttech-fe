"use client";

import { Play } from "lucide-react";
import { useFileList } from "@/lib/features/home/hooks/useFileList";
import { useEffect } from "react";
import { useUploadRefresh } from "@/lib/features/home/context/upload_refresh_context";
import { useFolderList } from "@/lib/features/home/hooks/useFolderList";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import FolderChip from "@/lib/cores/components/folder_chip";
import FileCard from "@/lib/cores/components/file_card";

export default function RepositoryGrid({ id }: { id: string }) {
  const { refreshTick, notifyUploadSuccess } = useUploadRefresh();

  const { files, loading: fileLoading, fetchFiles } = useFileList();
  const {
    folderList,
    loading: folderLoading,
    fetchFolders,
    deleteFolder,
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-[18px] font-semibold tracking-tight text-[#e8e9ea]">
            Repository
          </h1>
          <button
            className="
          flex items-center justify-center w-[26px] h-[26px] rounded-full
          text-[#7a7d82] hover:bg-[rgba(108,92,231,0.18)] hover:text-[#6c5ce7]
          transition-all duration-150
        "
          >
            <Play size={13} fill="currentColor" />
          </button>
        </div>

        {/* Folders row */}
        <div className="flex flex-wrap gap-2 mb-5">
          {folderList.map((folder) => (
            <FolderChip
              key={folder.id}
              name={folder.name}
              onDeleteTap={() => {
                deleteFolder(folder.id);
              }}
            />
          ))}
        </div>

        {/* Files grid */}
        <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
          {files.map((file) => (
            <FileCard key={file.id} name={file.name} thumbnail={undefined} />
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
