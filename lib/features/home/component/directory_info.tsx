"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentDirectory } from "../context/current_directory_context";
import { FolderModel } from "../types/folder";

export type DirectoryInfoType = {
  directories?: FolderModel[];
};

export default function DirectoryInfo({ directories }: DirectoryInfoType) {
  const router = useRouter();
  const { directoryList } = useCurrentDirectory();
  const activeDirectories = directories ?? directoryList;

  return (
    <section className="mb-5">
      <div className="flex items-center gap-3">
        <h1 className="text-[18px] font-semibold tracking-tight text-[#e8e9ea]">
          Repository
        </h1>
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="
            flex items-center justify-center w-[26px] h-[26px] rounded-full
            text-[#7a7d82] hover:bg-[rgba(108,92,231,0.18)] hover:text-[#6c5ce7]
            transition-all duration-150
          "
          aria-label="Go to repository root"
        >
          <Play size={13} fill="currentColor" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-[#7a7d82]">
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="hover:text-[#e8e9ea] transition-colors"
        >
          Root
        </button>

        {activeDirectories.map((directory) => (
          <div key={directory.id} className="flex items-center gap-1.5">
            <span className="text-[#4a4d52]">/</span>
            <button
              type="button"
              onClick={() => router.push(`/home/${directory.id}`)}
              className="truncate hover:text-[#e8e9ea] transition-colors"
            >
              {directory.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
