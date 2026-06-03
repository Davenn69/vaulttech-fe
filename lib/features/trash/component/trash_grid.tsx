import FileCard from "@/lib/cores/components/file_card";
import FolderChip from "@/lib/cores/components/folder_chip";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import EmptyState from "@/lib/cores/components/empty_state";
import ConfirmModal from "@/lib/cores/components/confirm_modal";
import { useTrash } from "../hooks/useTrash";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { Trash2 } from "lucide-react";
import { useUploadRefresh } from "../../home/context/upload_refresh_context";

export default function TrashGrid() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "file" | "folder";
    id: string;
    name: string;
  } | null>(null);
  const { refreshTick, notifyUploadSuccess } = useUploadRefresh();
  const {
    loading,
    folders,
    files,
    fetchDeletedFiles,
    fetchDeletedFolders,
    restoreFile,
    restoreFolder,
    deletePermanentFile,
    deletePermanentFolder,
  } = useTrash(notifyUploadSuccess);
  const isEmpty = folders.length === 0 && files.length === 0;

  const handleConfirmPermanentDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "file") {
      await deletePermanentFile(deleteTarget.id);
    } else {
      await deletePermanentFolder(deleteTarget.id);
    }

    setDeleteTarget(null);
  };

  useEffect(() => {
    fetchDeletedFiles();
    fetchDeletedFolders();
  }, [fetchDeletedFiles, fetchDeletedFolders, refreshTick]);

  return (
    <PageWrapper isLoading={loading}>
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-10 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        {isEmpty ? (
          <EmptyState
            icon={<Trash2 size={24} className="text-[#ff6b6b]" />}
            title="Trash is empty"
            description="There are no folders or files waiting to be restored. Deleted items will appear here."
          />
        ) : (
          <>
            {/* Folders row */}
            {folders.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {folders.map((folder) => (
                  <FolderChip
                    key={folder.id}
                    isFavourite={folder.isFavourite}
                    name={folder.name}
                    menuItems={[
                      {
                        label: "Restore",
                        danger: false,
                        onTap: () => {
                          restoreFolder(folder.id);
                        },
                      },
                      {
                        label: "Delete Permanently",
                        danger: true,
                        onTap: () => {
                          setDeleteTarget({
                            type: "folder",
                            id: folder.id,
                            name: folder.name,
                          });
                        },
                      },
                    ]}
                    onTap={() => {
                      router.push(PageRoutes.repositoryFolder(folder.id));
                    }}
                  />
                ))}
              </div>
            )}

            {/* Files grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
                {files.map((file) => (
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
                      {
                        label: "Delete Permanently",
                        danger: true,
                        onTap: () => {
                          setDeleteTarget({
                            type: "file",
                            id: file.id,
                            name: file.name,
                          });
                        },
                      },
                    ]}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <ConfirmModal
          open={deleteTarget !== null}
          title="Delete permanently?"
          description={
            deleteTarget
              ? `"${deleteTarget.name}" will be permanently deleted and cannot be recovered`
              : ""
          }
          confirmLabel="Delete Permanently"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmPermanentDelete}
          isLoading={loading}
        />
      </main>
    </PageWrapper>
  );
}
