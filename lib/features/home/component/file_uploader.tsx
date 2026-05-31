"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
} from "lucide-react";
import { FileUploadState } from "../hooks/useFileUpload";

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
  const visibleFiles = files;
  const uploadingCount = files.filter(
    (file) => file.status === "uploading" || file.status === "pending",
  ).length;
  const uploadedCount = files.filter(
    (file) => file.status === "success",
  ).length;
  const failedCount = files.filter((file) => file.status === "error").length;
  const maxVisibleItems = 3;
  const compactFiles = visibleFiles.slice(0, maxVisibleItems);
  const remainingCount = visibleFiles.length - compactFiles.length;

  if (!showSection) {
    return null;
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 overflow-hidden rounded-[24px] border border-[#232629] bg-[#16181a]/96 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:w-[24rem]">
      <div className="border-b border-[#232629] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#f1f3f5]">
                  Uploads
                </h2>
                <p className="text-xs text-[#8b9096]">
                  {uploadingCount > 0
                    ? "Uploading files"
                    : "Latest upload history"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-full border border-[#2b2e33] bg-[#111213] px-3 py-1 text-xs font-medium text-[#c5cad0]">
            {visibleFiles.length} file
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="rounded-full bg-[#111213] px-3 py-1 text-xs text-[#c5cad0]">
            Uploading <span className="text-[#f1f3f5]">{uploadingCount}</span>
          </div>
          <div className="rounded-full bg-[#111213] px-3 py-1 text-xs text-[#c5cad0]">
            Done <span className="text-[#f1f3f5]">{uploadedCount}</span>
          </div>
          {failedCount > 0 && (
            <div className="rounded-full bg-[#111213] px-3 py-1 text-xs text-[#c5cad0]">
              Failed <span className="text-[#f1f3f5]">{failedCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {uploadingCount > 0 && (
          <div className="space-y-2 rounded-2xl border border-[#232629] bg-[#111213] p-3">
            <div className="flex items-center justify-between text-xs text-[#8b9096]">
              <span>Total progress</span>
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
          <div className="space-y-2">
            {compactFiles.map((item, index) => {
              const sizeMB = (item.file.size / 1024 / 1024).toFixed(1);
              const isUploading =
                item.status === "uploading" || item.status === "pending";
              const isDone = item.status === "success";
              const isError = item.status === "error";
              const statusLabel = isUploading
                ? "Uploading"
                : isDone
                  ? "Done"
                  : isError
                    ? "Failed"
                    : "Queued";

              return (
                <div
                  key={`${item.file.name}-${index}`}
                  className="rounded-2xl border border-[#232629] bg-[#111213] p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1b1d1f] text-[#d7dbe0]">
                      <FileText size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#f1f3f5]">
                            {item.file.name}
                          </p>
                          <p className="mt-1 text-[11px] text-[#757c85]">
                            {sizeMB} MB
                            <span className="mx-1 text-[#3a3f45]">-</span>
                            {isUploading
                              ? "Uploading"
                              : isDone
                                ? "Completed"
                                : isError
                                  ? "Failed"
                                  : "Queued"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            isUploading
                              ? "border-[#3a315f] bg-[#201c35] text-[#c5befa]"
                              : isDone
                                ? "border-[#21472f] bg-[#12251a] text-[#8ff0b8]"
                                : isError
                                  ? "border-[#5c2c2c] bg-[#2c1717] text-[#ffb3b3]"
                                  : "border-[#2f3236] bg-[#1a1b1d] text-[#8b9096]"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1.5">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#232629]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone
                                ? "bg-[#23c16b]"
                                : isError
                                  ? "bg-[#ff6b6b]"
                                  : "bg-[#6c5ce7]"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#757c85]">
                          <span className="flex items-center gap-1.5">
                            {isDone ? (
                              <CheckCircle2
                                size={12}
                                className="text-[#23c16b]"
                              />
                            ) : isError ? (
                              <AlertCircle
                                size={12}
                                className="text-[#ff6b6b]"
                              />
                            ) : (
                              <Clock3 size={12} className="text-[#8b9096]" />
                            )}
                            {item.error ?? `${item.progress}%`}
                          </span>
                          <span>{isDone ? "Done" : "Active"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {remainingCount > 0 && (
              <div className="rounded-2xl border border-dashed border-[#2b2e33] bg-[#111213] px-4 py-3 text-center text-xs text-[#8b9096]">
                +{remainingCount} more files
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#2b2e33] bg-[#111213] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#d7dbe0]">
              No upload history yet
            </p>
            <p className="mt-1 text-xs text-[#757c85]">
              Files that are currently uploading will appear in this panel.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
