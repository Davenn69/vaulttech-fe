"use client";

import FileCard from "@/lib/cores/components/file_card";
import FolderChip from "@/lib/cores/components/folder_chip";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useFavourites from "../hooks/useFavourites";
import { useFolderModal } from "../../home/context/folder_modal_context";
import { useUploadRefresh } from "../../home/context/upload_refresh_context";
import { useFileList } from "../../home/hooks/useFileList";
import { useFolderList } from "../../home/hooks/useFolderList";
import { PageRoutes } from "@/lib/cores/utils/navigation";

export default function FavouriteGrid() {
  const router = useRouter();
  const {
    loading,
    folders,
    files,
    fetchFavouriteFiles,
    fetchFavouriteFolders,
  } = useFavourites();

  const { openUpdateFolderModal, openUpdateFileModal } = useFolderModal();
  const { refreshTick, notifyUploadSuccess } = useUploadRefresh();

  //API - related
  const { deleteFile, removeFileFromFavourites, downloadFile } =
    useFileList(notifyUploadSuccess);
  const { deleteFolder, removeFolderFromFavourites } =
    useFolderList(notifyUploadSuccess);

  useEffect(() => {
    fetchFavouriteFiles();
    fetchFavouriteFolders();
  }, [fetchFavouriteFiles, fetchFavouriteFolders, refreshTick]);

  return (
    <PageWrapper isLoading={loading}>
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-10 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        {/* <DirectoryInfo /> */}

        {/* Folders row */}
        <div className="flex flex-wrap gap-2 mb-5">
          {folders!.map((folder) => (
            <FolderChip
              key={folder.id}
              isFavourite={folder.isFavourite}
              name={folder.name}
              menuItems={[
                {
                  label: "Rename",
                  danger: false,
                  onTap: () => openUpdateFolderModal(folder.id, folder.name),
                },
                {
                  label: "Remove from Favourites",
                  danger: false,
                  onTap: () => removeFolderFromFavourites(folder.id),
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
                // pushDirectory(folder);
                router.push(PageRoutes.repositoryFolder(folder.id));
              }}
            />
          ))}
        </div>

        {/* Files grid */}
        <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
          {files!.map((file) => (
            <FileCard
              key={file.id}
              isFavourite={file.isFavourite}
              name={file.name}
              thumbnail={undefined}
              menuItems={[
                { label: "Open", danger: false, onTap: () => {} },
                {
                  label: "Rename",
                  danger: false,
                  onTap: () => openUpdateFileModal(file.id, file.name),
                },
                {
                  label: "Remove from Favourites",
                  danger: false,
                  onTap: () => removeFileFromFavourites(file.id),
                },
                {
                  label: "Download",
                  danger: false,
                  onTap: () => {
                    downloadFile(file.id);
                  },
                },
                {
                  label: "Delete",
                  danger: true,
                  onTap: () => deleteFile(file.id),
                },
              ]}
            />
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
