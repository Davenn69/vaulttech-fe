"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import { useEffect } from "react";
import useRecent from "../hooks/useRecent";
import FolderChip from "@/lib/cores/components/folder_chip";
import FileCard from "@/lib/cores/components/file_card";

export default function RecentGrid() {
  const { recent, loading, fetchRecent } = useRecent();

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return (
    <PageWrapper isLoading={loading}>
      <main className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pt-6 pb-10">
        {recent.map((group) => (
          <section key={group.date} className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400">
              {group.date}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Folder
                </h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.folder.map((item) => (
                    <FolderChip name={item.name} menuItems={[]} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  File
                </h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.file.map((item) => (
                    <FileCard name={item.name} menuItems={[]} />
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
