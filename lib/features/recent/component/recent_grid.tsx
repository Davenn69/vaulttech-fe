"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { useEffect } from "react";
import useRecent from "../hooks/useRecent";
import FolderChip from "@/lib/cores/components/folder_chip";
import FileCard from "@/lib/cores/components/file_card";
import { useFolderModal } from "../../home/context/folder_modal_context";
import { useUploadRefresh } from "../../home/context/upload_refresh_context";
import { useFileList } from "../../home/hooks/useFileList";
import { useFolderList } from "../../home/hooks/useFolderList";

function formatGroupDate(dateValue: string) {
  const isoDateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsedDate);
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export default function RecentGrid() {
  const { openUpdateFolderModal, openUpdateFileModal } = useFolderModal();
  const { refreshTick, notifyUploadSuccess } = useUploadRefresh();

  //API - related
  const { deleteFile, addFileToFavourite, downloadFile } =
    useFileList(notifyUploadSuccess);
  const { deleteFolder, addFolderToFavourite } =
    useFolderList(notifyUploadSuccess);

  const { recent, loading, fetchRecent } = useRecent();

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent, refreshTick]);

  return (
    <PageWrapper isLoading={loading}>
      <main className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pt-6 pb-10">
        {recent.map((group) => (
          <section key={group.date} className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400">
              {formatGroupDate(group.date)}
            </h2>

            <div className="space-y-4">
              <div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.folder.map((item) => (
                    <FolderChip
                      key={item.id}
                      isFavourite={item.isFavourite}
                      name={item.name}
                      menuItems={[
                        {
                          label: "Rename",
                          danger: false,
                          onTap: () =>
                            openUpdateFolderModal(item.id, item.name),
                        },
                        {
                          label: "Add to Favourites",
                          danger: false,
                          onTap: () => addFolderToFavourite(item.id),
                        },
                        {
                          label: "Move to Trash",
                          danger: true,
                          onTap: () => {
                            deleteFolder(item.id);
                          },
                        },
                      ]}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.file.map((item) => (
                    <FileCard
                      key={item.id}
                      isFavourite={item.isFavourite}
                      name={item.name}
                      menuItems={[
                        { label: "Open", danger: false, onTap: () => {} },
                        {
                          label: "Rename",
                          danger: false,
                          onTap: () => openUpdateFileModal(item.id, item.name),
                        },
                        {
                          label: "Add to Favourites",
                          danger: false,
                          onTap: () => addFileToFavourite(item.id),
                        },
                        {
                          label: "Download",
                          danger: false,
                          onTap: () => {
                            downloadFile(item.id);
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
      </main>
    </PageWrapper>
  );
}
