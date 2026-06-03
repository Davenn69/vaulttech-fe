"use client";

import Image from "next/image";
import { MoreHorizontal, Search, Send, Star, X } from "lucide-react";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { MenuItemType } from "../types/menu_item_type";
import toast from "react-hot-toast";
import { useReviewers } from "@/lib/features/invitations/hooks/useReviewers";
import ShareFileModal from "@/lib/features/invitations/component/share_file_modal";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type FileCardType = {
  id?: string;
  name: string;
  extension: string;
  menuItems: MenuItemType[];
  isFavourite?: boolean;
  isDisabled?: boolean;
  statusLabel?: string;
  statusColor?: string;
  onTap?: () => void;
  allowInviteReviewers?: boolean;
  allowShareFile?: boolean;
};

const FILE_ICON_BY_EXTENSION: Record<string, string> = {
  doc: "/assets/icons/Word_Icon.svg",
  docx: "/assets/icons/Word_Icon.svg",
  xls: "/assets/icons/Excel_Icon.svg",
  xlsx: "/assets/icons/Excel_Icon.svg",
  pdf: "/assets/icons/Pdf_Icon.svg",
  pptx: "/assets/icons/Ppt_Icon.svg",
  jpg: "/assets/icons/Photo_Icon.svg",
  png: "/assets/icons/Photo_Icon.svg",
  jpeg: "/assets/icons/Photo_Icon.svg",
};

function getFileIcon(extension: string) {
  const normalizedExtension = extension.toLowerCase().replaceAll(".", "");
  return (
    FILE_ICON_BY_EXTENSION[normalizedExtension] ??
    "/assets/icons/Normal_File_Icon.svg"
  );
}

export default function FileCard({
  id,
  name,
  extension,
  menuItems,
  isFavourite,
  isDisabled,
  statusLabel,
  statusColor,
  onTap,
  allowInviteReviewers = false,
  allowShareFile = false,
}: FileCardType) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mounted = typeof window !== "undefined";
  const {
    query,
    setQuery,
    reviewers,
    loading,
    clearReviewers,
    refreshReviewers,
    sendInvite,
  } = useReviewers(inviteOpen);

  const updateMenuPosition = useCallback(() => {
    const buttonEl = buttonRef.current;
    if (!buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = 160;
    const menuItemCount =
      menuItems.length +
      (allowInviteReviewers ? 1 : 0) +
      (allowShareFile && id ? 1 : 0);
    const menuHeight = Math.min(
      menuItemCount * 40 + 8,
      window.innerHeight - 16,
    );
    const gap = 8;
    const padding = 8;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.right - menuWidth;
    left = Math.max(
      padding,
      Math.min(left, viewportWidth - menuWidth - padding),
    );

    let top = rect.bottom + gap;
    if (
      top + menuHeight > viewportHeight - padding &&
      rect.top - gap - menuHeight >= padding
    ) {
      top = rect.top - gap - menuHeight;
    }

    setMenuPosition({ top, left });
  }, [allowInviteReviewers, allowShareFile, id, menuItems.length]);

  useIsomorphicLayoutEffect(() => {
    if (!menuOpen || !mounted) return;
    updateMenuPosition();
  }, [menuOpen, mounted, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handler = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (!inviteOpen) return undefined;

    refreshReviewers();

    const handler = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;

      if (target instanceof Element && target.closest("[data-invite-sheet]")) {
        return;
      }

      setInviteOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [inviteOpen, refreshReviewers]);

  const toggleReviewer = (reviewerId: string) => {
    setSelectedReviewerId((current) =>
      current === reviewerId ? null : reviewerId,
    );
  };

  const handleSendInvites = () => {
    if (!selectedReviewerId) {
      toast.error("Select at least one reviewer first.");
      return;
    }

    const selectedReviewer = reviewers.find(
      (reviewer) => reviewer.id === selectedReviewerId,
    );

    if (!id || !selectedReviewer) {
      toast.error("Unable to send the invite.");
      return;
    }

    sendInvite(selectedReviewer.id, id);

    setInviteOpen(false);
    setSelectedReviewerId(null);
    clearReviewers();
  };

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleViewportChange = () => {
      updateMenuPosition();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [menuOpen, updateMenuPosition]);

  return (
    <div
      data-item-id={id}
      aria-disabled={isDisabled}
      className={`
      group relative bg-[#1e2022] border border-[#222426] rounded-2xl
      overflow-visible transition-all duration-150
      ${
        isDisabled
          ? "cursor-default"
          : "cursor-pointer hover:border-[#2a2c2e] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      }
    `}
    >
      <div
        className="overflow-hidden rounded-2xl"
        onClick={() => {
          if (isDisabled) return;
          onTap?.();
        }}
      >
        {/* Preview */}
        <div
          className={`relative aspect-[4/3] bg-[#f5f6f7] flex items-center justify-center overflow-hidden ${
            isDisabled ? "" : "group-hover:bg-[#edf0f2]"
          }`}
        >
          {(statusLabel && statusColor) || isFavourite ? (
            <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
              {statusLabel && statusColor ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#1a1b1d]/85 px-2.5 py-1 text-[11px] font-medium text-[#f1f3f5] shadow-[0_4px_14px_rgba(0,0,0,0.28)] backdrop-blur-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-white/25"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="truncate">{statusLabel}</span>
                </div>
              ) : null}

              {isFavourite && (
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1b1d]/85 text-[#f1c84c] shadow-[0_4px_14px_rgba(0,0,0,0.28)] backdrop-blur-sm">
                  <Star size={11} className="fill-current" />
                </div>
              )}
            </div>
          ) : null}

          <Image
            src={getFileIcon(extension)}
            alt={`${name} preview`}
            width={88}
            height={88}
            className="h-20 w-20 object-contain"
          />

          {!isDisabled && (
            <div
              className="
              absolute inset-0 bg-black/35 flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity duration-150
            "
            >
              <button
                className="
                px-[18px] py-[7px] bg-white text-[#111] rounded-full
                text-xs font-semibold transition-transform duration-100 hover:scale-105
              "
              >
                Open
              </button>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between px-3 py-[9px] bg-[#1e2022]">
          <span className="text-xs text-[#7a7d82] truncate flex-1">{name}</span>

          {/* Dropdown trigger */}
          <button
            ref={buttonRef}
            onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setMenuOpen((p) => !p);
            }}
            className="
              flex items-center justify-center w-6 h-6 rounded shrink-0
              text-[#4a4d52] hover:bg-[#252729] hover:text-[#7a7d82]
              transition-all duration-100
            "
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {mounted &&
        menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="
              fixed z-[1000]
              bg-[#1a1b1d] border border-[#2a2c2e] rounded-xl
              p-1 w-[160px] max-h-[calc(100vh-16px)] overflow-y-auto
              shadow-[0_8px_24px_rgba(0,0,0,0.4)]
            "
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {menuItems.map(({ label, danger, onTap }) => (
              <button
                key={label}
                onClick={() => {
                  onTap?.();
                  setMenuOpen(false);
                }}
                className={`
                  block w-full px-2.5 py-[7px] text-left text-[13px] rounded-lg
                  transition-all duration-100
                  ${
                    danger
                      ? "text-[#7a7d82] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.08)]"
                      : "text-[#7a7d82] hover:bg-[#252729] hover:text-[#e8e9ea]"
                  }
                `}
              >
                {label}
              </button>
            ))}
            {allowInviteReviewers && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setInviteOpen(true);
                }}
                className="
                  block w-full px-2.5 py-[7px] text-left text-[13px] rounded-lg
                  text-[#7a7d82] transition-all duration-100
                  hover:bg-[#252729] hover:text-[#e8e9ea]
                "
              >
                Invite Reviewer
              </button>
            )}
            {allowShareFile && id ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen(false);
                  window.setTimeout(() => setShareOpen(true), 0);
                }}
                className="
                  block w-full px-2.5 py-[7px] text-left text-[13px] rounded-lg
                  text-[#7a7d82] transition-all duration-100
                  hover:bg-[#252729] hover:text-[#e8e9ea]
                "
              >
                Share File
              </button>
            ) : null}
          </div>,
          document.body,
        )}

      {mounted &&
        inviteOpen &&
        createPortal(
          <div className="fixed inset-0 z-[1100] bg-black/65 backdrop-blur-[2px]">
            <div className="flex h-full items-center justify-center px-4 py-4">
              <div
                data-invite-sheet
                className="
                  flex h-[560px] w-[640px] max-h-[calc(100vh-2rem)]
                  max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl
                  border border-[#2a2c2e] bg-[#111213]
                  shadow-[0_24px_60px_rgba(0,0,0,0.55)]
                "
              >
                <div className="flex items-center justify-between border-b border-[#222426] px-5 py-4">
                  <div>
                    <h3 className="text-base font-semibold text-[#f6f7f8]">
                      Invite reviewers
                    </h3>
                    <p className="text-sm text-[#7a7d82]">
                      Select a user to review file{" "}
                      <span className="text-[#e8e9ea]">{name}</span>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInviteOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7a7d82] transition-colors hover:bg-[#252729] hover:text-[#e8e9ea]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <div className="mb-4 relative">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4d52]"
                    />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search reviewer..."
                      className="
                        w-full rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d]
                        py-3 pl-9 pr-4 text-sm text-[#e8e9ea]
                        placeholder-[#4a4d52] outline-none transition-colors
                        focus:border-[#6c5ce7]
                      "
                    />
                  </div>

                  <div className="grid gap-3">
                    {loading ? (
                      <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#1a1b1d] px-4 py-10 text-center text-sm text-[#7a7d82]">
                        Loading reviewers...
                      </div>
                    ) : reviewers.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#1a1b1d] px-4 py-10 text-center text-sm text-[#7a7d82]">
                        No reviewer found for &quot;{query.trim()}&quot;
                      </div>
                    ) : (
                      reviewers.map((reviewer) => {
                        const selected = selectedReviewerId === reviewer.id;

                        return (
                          <button
                            key={reviewer.id}
                            type="button"
                            onClick={() => toggleReviewer(reviewer.id)}
                            className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors ${
                              selected
                                ? "border-[#6c5ce7] bg-[rgba(108,92,231,0.12)]"
                                : "border-[#2a2c2e] bg-[#1a1b1d] hover:bg-[#252729]"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-[#f6f7f8]">
                                {reviewer.username}
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
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#222426] px-5 py-4">
                  <div className="text-sm text-[#7a7d82]">
                    {selectedReviewerId
                      ? "1 reviewer selected"
                      : "No reviewer selected"}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInviteOpen(false);
                        setSelectedReviewerId(null);
                        clearReviewers();
                      }}
                      className="rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendInvites}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7d6ef0]"
                    >
                      <Send size={15} />
                      Send invite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <ShareFileModal
        open={shareOpen}
        fileId={id}
        fileName={name}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
