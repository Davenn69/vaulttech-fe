"use client";

import FileCard from "@/lib/cores/components/file_card";
import FolderChip from "@/lib/cores/components/folder_chip";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import { openFile } from "@/lib/cores/utils/fileUtils";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFileList } from "@/lib/features/home/hooks/useFileList";
import { useSharedFiles } from "../hooks/useSharedFiles";
import CategorySelectMenu from "@/lib/features/category/component/category_select_menu";

export default function SharedFilesPage() {
  const router = useRouter();
  const { downloadFile } = useFileList();
  const {
    hydrated,
    loading,
    sharedFolders,
    sharedFiles,
    fetchSharedFiles,
  } = useSharedFiles();
  const [selectedFileForCategory, setSelectedFileForCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <PageWrapper isLoading={!hydrated || loading}>
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-10 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        <div className="flex flex-wrap gap-2 mb-5">
          {sharedFolders.map((folder) => (
            <FolderChip
              key={folder.id}
              isFavourite={folder.isFavourite}
              name={folder.name}
              menuItems={[
                {
                  label: "Open",
                  danger: false,
                  onTap: () => {
                    router.push(PageRoutes.repositoryFolder(folder.id));
                  },
                },
              ]}
              onTap={() => {
                router.push(PageRoutes.repositoryFolder(folder.id));
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
          {sharedFiles.map((file) => (
            <FileCard
              key={file.id}
              isFavourite={file.isFavourite}
              name={file.name}
              id={file.id}
              extension={file.extension}
              statusLabel={file.category?.name ?? undefined}
              statusColor={file.category?.color ?? undefined}
              onTap={() => openFile(file.extension, file.id, router)}
              menuItems={[
                {
                  label: "Open",
                  danger: false,
                  onTap: () => openFile(file.extension, file.id, router),
                },
                {
                  label: "Download",
                  danger: false,
                  onTap: () => {
                    downloadFile(file.id);
                  },
                },
                {
                  label: "Set Category",
                  danger: false,
                  onTap: () => {
                    setSelectedFileForCategory({
                      id: file.id,
                      name: file.name,
                    });
                  },
                },
              ]}
            />
          ))}
        </div>

        <CategorySelectMenu
          open={selectedFileForCategory !== null}
          fileId={selectedFileForCategory?.id ?? ""}
          fileName={selectedFileForCategory?.name ?? ""}
          onClose={() => setSelectedFileForCategory(null)}
          onSuccess={() => void fetchSharedFiles()}
        />
      </main>
    </PageWrapper>
  );
}
