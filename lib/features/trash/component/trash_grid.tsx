import FileCard from "@/lib/cores/components/file_card";
import FolderChip from "@/lib/cores/components/folder_chip";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import { useTrash } from "../hooks/useTrash";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageRoutes } from "@/lib/cores/utils/navigation";

export default function TrashGrid() {
  const router = useRouter();
  const {
    loading,
    folders,
    files,
    fetchDeletedFiles,
    fetchDeletedFolders,
    restoreFile,
    restoreFolder,
  } = useTrash();

  useEffect(() => {
    fetchDeletedFiles();
    fetchDeletedFolders();
  }, [fetchDeletedFiles, fetchDeletedFolders]);

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
                  label: "restore",
                  danger: false,
                  onTap: () => {
                    restoreFolder(folder.id);
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
              extension={file.extension}
              statusLabel={file.categoryName ?? undefined}
              statusColor={file.categoryColor ?? undefined}
              isDisabled
              menuItems={[
                {
                  label: "Restore",
                  danger: false,
                  onTap: () => {
                    restoreFile(file.id);
                  },
                },
              ]}
            />
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
