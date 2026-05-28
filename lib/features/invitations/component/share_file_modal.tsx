"use client";

import { Search, Send, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, type FormEvent } from "react";
import { useShareUsers } from "../hooks/useShareUsers";
import type { PermissionType } from "../hooks/useShareUsers";

type ShareFileModalProps = {
  open: boolean;
  fileId?: string;
  folderId?: string;
  fileName?: string;
  onClose: () => void;
  onShared?: () => void | Promise<void>;
};

function ShareFileDialog({
  fileId,
  folderId,
  fileName,
  onClose,
  onShared,
}: Omit<ShareFileModalProps, "open">) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [permissionType, setPermissionType] =
    useState<PermissionType>("read");
  const { query, setQuery, users, searching, sharing, createPermission } =
    useShareUsers(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const selectedUser = users.find((user) => user.id === selectedUserId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fileId || !selectedUserId || sharing) {
      return;
    }

    await createPermission(fileId, selectedUserId, permissionType, folderId);
    onClose();
    await onShared?.();
  };

  return (
    <div
      className="w-full max-w-2xl rounded-3xl border border-[#2a2c2e] bg-[#16181a] p-5 text-[#e8e9ea] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-file-modal-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="share-file-modal-title"
            className="text-base font-semibold tracking-tight"
          >
            Create permission
          </h2>
          <p className="text-sm leading-6 text-[#8b9096]">
            Pilih user dan jenis permission untuk file
            {fileName ? ` "${fileName}"` : ""}.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2c2e] bg-transparent text-[#c5cad0] transition-colors hover:bg-[#1f2124]"
          aria-label="Close share modal"
        >
          <X size={18} />
        </button>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#c5cad0]">Search user</span>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4d52]"
            />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by username..."
              className="w-full rounded-2xl border border-[#2a2c2e] bg-[#111213] py-3 pl-10 pr-4 text-sm text-[#f1f3f5] outline-none transition-colors placeholder:text-[#5f656d] focus:border-[#6c5ce7]"
            />
          </div>
        </label>

        <div className="space-y-2">
          <span className="text-sm font-medium text-[#c5cad0]">
            Permission type
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                value: "read" as const,
                title: "Read",
                description: "User hanya bisa melihat file.",
              },
              {
                value: "write" as const,
                title: "Write",
                description: "User bisa melihat dan mengedit file.",
              },
            ].map((option) => {
              const selected = permissionType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPermissionType(option.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-[#6c5ce7] bg-[rgba(108,92,231,0.12)]"
                      : "border-[#2a2c2e] bg-[#111213] hover:bg-[#1f2124]"
                  }`}
                >
                  <div className="text-sm font-medium text-[#f6f7f8]">
                    {option.title}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-[#7a7d82]">
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
          {searching ? (
            <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-10 text-center text-sm text-[#7a7d82]">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-10 text-center text-sm text-[#7a7d82]">
              No user found for &quot;{query.trim()}&quot;
            </div>
          ) : (
            users.map((user) => {
              const selected = selectedUserId === user.id;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() =>
                    setSelectedUserId((current) =>
                      current === user.id ? null : user.id,
                    )
                  }
                  className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-[#6c5ce7] bg-[rgba(108,92,231,0.12)]"
                      : "border-[#2a2c2e] bg-[#111213] hover:bg-[#1f2124]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[#f6f7f8]">
                      {user.username}
                    </div>
                    <div className="mt-1 text-xs text-[#7a7d82]">
                      {user.isActive ? "Active user" : "Inactive user"}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      selected
                        ? "bg-[#6c5ce7] text-white"
                        : "bg-[#252729] text-[#7a7d82]"
                    }`}
                  >
                    {selected ? "Selected" : "Select"}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#222426] pt-4">
          <div className="text-sm text-[#7a7d82]">
            {selectedUser
              ? `Ready to grant ${permissionType} access to ${selectedUser.username}`
              : "Select a user to continue"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sharing || !selectedUserId || !fileId}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={15} />
              {sharing ? "Saving..." : "Grant permission"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ShareFileModal({
  open,
  fileId,
  folderId,
  fileName,
  onClose,
  onShared,
}: ShareFileModalProps) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 px-4"
      role="presentation"
      onClick={onClose}
    >
      <ShareFileDialog
        fileId={fileId}
        folderId={folderId}
        fileName={fileName}
        onClose={onClose}
        onShared={onShared}
      />
    </div>,
    document.body,
  );
}
