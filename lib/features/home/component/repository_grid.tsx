"use client";

import { useFileList } from "@/lib/features/home/hooks/useFileList";
import { useEffect, useRef } from "react";
import { useUploadRefresh } from "@/lib/features/home/context/upload_refresh_context";
import { useFolderModal } from "@/lib/features/home/context/folder_modal_context";
import { useFolderList } from "@/lib/features/home/hooks/useFolderList";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import FolderChip from "@/lib/cores/components/folder_chip";
import FileCard from "@/lib/cores/components/file_card";
import { useRouter } from "next/navigation";
import { useCurrentDirectory } from "../context/current_directory_context";
import ItemManager, { DraggableItemModel } from "../types/itemManager";

export default function RepositoryGrid({ id }: { id: string }) {
  const router = useRouter();

  const { refreshTick, notifyUploadSuccess } = useUploadRefresh();
  const { openUpdateFolderModal, openUpdateFileModal } = useFolderModal();
  const { pushDirectory } = useCurrentDirectory();

  const gridRef = useRef<HTMLDivElement | null>(null);
  const itemManagerRef = useRef<ItemManager | null>(null);

  //API - related
  const {
    files,
    loading: fileLoading,
    fetchFiles,
    deleteFile,
    addFileToFavourite,
    downloadFile,
  } = useFileList(notifyUploadSuccess);
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

  useEffect(() => {
    itemManagerRef.current = new ItemManager(
      process.env.NEXT_PUBLIC_BASE_URL ?? "",
      notifyUploadSuccess,
    );

    return () => {
      itemManagerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const manager = itemManagerRef.current;
    const root = gridRef.current;
    if (!manager || !root) return;

    manager.destroy();

    const registerItem = (
      element: HTMLElement | null,
      item: DraggableItemModel,
      isDropTarget = false,
    ) => {
      if (!element) return;
      manager.registerDraggable(element, item);

      if (isDropTarget && "parentId" in item) {
        manager.registerDropTarget(element, item);
      }
    };

    folderList.forEach((folder) => {
      const element = root.querySelector<HTMLElement>(
        `[data-item-id="${folder.id}"]`,
      );
      registerItem(element, folder, true);
    });

    files.forEach((file) => {
      const element = root.querySelector<HTMLElement>(
        `[data-item-id="${file.id}"]`,
      );
      registerItem(element, file, false);
    });
  }, [files, folderList]);

  return (
    <PageWrapper isLoading={fileLoading && folderLoading}>
      <main
        ref={gridRef}
        className="flex-1 overflow-y-auto px-6 pt-6 pb-10 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent"
      >
        {/* <DirectoryInfo /> */}

        {/* Folders row */}
        <div className="flex flex-wrap gap-2 mb-5">
          {folderList.map((folder) => (
            <div key={folder.id} data-item-id={folder.id} className="w-fit">
              <FolderChip
                isFavourite={folder.isFavourite}
                name={folder.name}
                menuItems={[
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
            </div>
          ))}
        </div>

        {/* Files grid */}
        <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
          {files.map((file) => (
            <div key={file.id} data-item-id={file.id}>
              <FileCard
                isFavourite={file.isFavourite}
                name={file.name}
                id={file.id}
                menuItems={[
                  {
                    label: "Open",
                    danger: false,
                    onTap: () => {
                      router.push(`/word/${file.id}`);
                    },
                  },
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
                thumbnail={undefined}
              />
            </div>
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
