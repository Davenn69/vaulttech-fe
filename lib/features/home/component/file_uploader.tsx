"use client";

import { FileUploadState } from "../hooks/useFileUpload";
import { FileItem } from "./file_upload_item";

type FileUploaderType = {
  showSection: boolean;
  files: FileUploadState[];
  totalProgress: number;
};

export function FileUploader({
  showSection,
  files,
  totalProgress,
}: FileUploaderType) {
  const visibleFiles = files.filter(
    (file) => file.status === "uploading" || file.status === "success",
  );
  const uploadingCount = visibleFiles.filter(
    (file) => file.status === "uploading",
  ).length;
  const uploadedCount = visibleFiles.filter(
    (file) => file.status === "success",
  ).length;

  if (!showSection) {
    return null;
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 space-y-4 rounded-2xl border border-[#232629] bg-[#16181a]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:w-[28rem]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f1f3f5]">
            Upload History
          </h2>
          <p className="text-sm text-[#8b9096]">
            Menampilkan file yang sedang diproses dan yang sudah selesai
            diupload.
          </p>
        </div>

        <div className="rounded-full border border-[#2b2e33] bg-[#111213] px-3 py-1 text-xs font-medium text-[#c5cad0]">
          {visibleFiles.length} file
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#232629] bg-[#111213] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[#6f7680]">
            Uploading
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#f1f3f5]">
            {uploadingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#232629] bg-[#111213] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[#6f7680]">
            Uploaded
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#f1f3f5]">
            {uploadedCount}
          </p>
        </div>
      </div>

      {uploadingCount > 0 && (
        <div className="space-y-2 rounded-2xl border border-[#232629] bg-[#111213] p-3">
          <div className="flex items-center justify-between text-xs text-[#8b9096]">
            <span>Overall progress</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#232629]">
            <div
              className="h-full rounded-full bg-[#6c5ce7] transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {visibleFiles.length > 0 ? (
        <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {visibleFiles.map((item, index) => (
            <FileItem key={`${item.file.name}-${index}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#2b2e33] bg-[#111213] px-4 py-8 text-center">
          <p className="text-sm font-medium text-[#d7dbe0]">
            Belum ada riwayat upload
          </p>
          <p className="mt-1 text-xs text-[#757c85]">
            File yang sedang diupload atau sudah selesai akan muncul di sini.
          </p>
        </div>
      )}
    </aside>
  );
}
