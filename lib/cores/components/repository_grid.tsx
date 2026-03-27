"use client";

import { Play } from "lucide-react";
import FolderChip from "./folder_chip";
import FileCard from "./file_card";
import { useFileList } from "@/lib/features/home/hooks/useFileList";
import PageWrapper from "./page_wrapper";

const FOLDERS = [
  { id: 1, name: "Design Assets" },
  { id: 2, name: "Projects" },
  { id: 3, name: "Archive" },
  { id: 4, name: "Shared" },
  { id: 5, name: "Templates" },
];

const FILES = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: "Outline.docx",
}));

export default function RepositoryGrid({ id }: { id: string }) {
  const { files, loading: fileLoading, fetchFiles } = useFileList(id);

  console.log(files);
  return (
    <PageWrapper isLoading={fileLoading}>
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
          {FOLDERS.map((folder) => (
            <FolderChip key={folder.id} name={folder.name} />
          ))}
        </div>

        {/* Files grid */}
        <div className="grid grid-cols-5 gap-3.5 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3">
          {FILES.map((file) => (
            <FileCard key={file.id} name={file.name} thumbnail={undefined} />
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
