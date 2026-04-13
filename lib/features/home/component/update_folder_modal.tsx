"use client";

import { useEffect, useState, type FormEvent } from "react";

type CreateFolderModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => void | Promise<void>;
  isLoading?: boolean;
  initialValue?: string;
  title?: string;
};

export default function UpdateFolderModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  initialValue = "",
  title = "Update folder",
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState(initialValue);

  useEffect(() => {
    if (open) {
      setFolderName(initialValue);
    }
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = folderName.trim();
    if (!trimmedName || isLoading) {
      return;
    }

    await onSubmit(trimmedName);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-folder-modal-title"
        className="w-full max-w-md rounded-2xl border border-[#2a2c2e] bg-[#16181a] p-5 text-[#e8e9ea] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-1">
          <h2
            id="create-folder-modal-title"
            className="text-base font-semibold tracking-tight"
          >
            {title}
          </h2>
          <p className="text-sm text-[#8b9096]">
            Give your folder a clear name so it is easy to find later.
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#c5cad0]">
              Folder name
            </span>
            <input
              autoFocus
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="New folder"
              className="w-full rounded-xl border border-[#2a2c2e] bg-[#111213] px-4 py-3 text-sm text-[#f1f3f5] outline-none transition-colors placeholder:text-[#5f656d] focus:border-[#6c5ce7]"
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#2a2c2e] bg-transparent px-4 py-2.5 text-sm font-medium text-[#c5cad0] transition-colors hover:bg-[#1f2124]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !folderName.trim()}
              className="rounded-xl bg-[#6c5ce7] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7d6ef0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
