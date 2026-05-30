"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { useCategories } from "../hooks/useCategories";
import FileCard from "@/lib/cores/components/file_card";
import { openFile } from "@/lib/cores/utils/fileUtils";
import { useRouter } from "next/navigation";
import { useFileList } from "../../home/hooks/useFileList";
import { useUploadRefresh } from "../../home/context/upload_refresh_context";
import { useFolderModal } from "../../home/context/folder_modal_context";
import { useEffect, useState } from "react";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import CategorySelectMenu from "./category_select_menu";

export default function CategoryGrid() {
  const { files, fetchFilesByCategories, loading } = useCategories();
  const { refreshTick, notifyUploadSuccess } = useUploadRefresh();
  const { openUpdateFileModal } = useFolderModal();
  const [selectedFileForCategory, setSelectedFileForCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const {
    deleteFile,
    addFileToFavourite,
    downloadFile,
    removeFileFromFavourites,
  } = useFileList(notifyUploadSuccess);
  const router = useRouter();

  useEffect(() => {
    fetchFilesByCategories();
  }, [refreshTick, fetchFilesByCategories]);

  return (
    <PageWrapper isLoading={loading}>
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-10 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
        {files.map((group) => (
          <section key={group.name} className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400">
              {group.name}
            </h2>

            <div className="space-y-4">
              <div>
                <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
                  {group.file.map((item) => (
                    <FileCard
                      key={item.id}
                      isFavourite={item.isFavourite}
                      name={item.name}
                      extension={item.extension}
                      statusLabel={item.category?.name ?? undefined}
                      statusColor={item.category?.color ?? undefined}
                      onTap={() => {
                        openFile(item.extension, item.id, router);
                      }}
                      menuItems={[
                        {
                          label: "Open",
                          danger: false,
                          onTap: () => {
                            openFile(item.extension, item.id, router);
                          },
                        },
                        {
                          label: "Rename",
                          danger: false,
                          onTap: () => openUpdateFileModal(item.id, item.name),
                        },
                        {
                          label: item.isFavourite
                            ? "Remove from Favourites"
                            : "Add to Favourites",
                          danger: false,
                          onTap: () => {
                            if (item.isFavourite) {
                              removeFileFromFavourites(item.id);
                            } else {
                              addFileToFavourite(item.id);
                            }
                          },
                        },
                        {
                          label: "Download",
                          danger: false,
                          onTap: () => {
                            downloadFile(item.id);
                          },
                        },
                        {
                          label: "Set Category",
                          danger: false,
                          onTap: () => {
                            setSelectedFileForCategory({
                              id: item.id,
                              name: item.name,
                            });
                          },
                        },
                        {
                          label: "History",
                          danger: false,
                          onTap: () => {
                            router.push(PageRoutes.recordFile(item.id));
                          },
                        },
                        {
                          label: "Delete",
                          danger: true,
                          onTap: () => deleteFile(item.id),
                        },
                      ]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        <CategorySelectMenu
          open={selectedFileForCategory !== null}
          fileId={selectedFileForCategory?.id ?? ""}
          fileName={selectedFileForCategory?.name ?? ""}
          onClose={() => setSelectedFileForCategory(null)}
          onSuccess={notifyUploadSuccess}
        />
      </main>
    </PageWrapper>
  );
}
