"use client";

import { MoreHorizontal, FileText, Star } from "lucide-react";
import { createPortal } from "react-dom";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { MenuItemType } from "../types/menu_item_type";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type FileCardType = {
  id?: string;
  name: string;
  thumbnail?: string;
  menuItems: MenuItemType[];
  isFavourite?: boolean;
  onTap: () => void;
};

export default function FileCard({
  id,
  name,
  thumbnail,
  menuItems,
  isFavourite,
  onTap,
}: FileCardType) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = () => {
    const buttonEl = buttonRef.current;
    if (!buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 172;
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
  };

  useIsomorphicLayoutEffect(() => {
    if (!menuOpen || !mounted) return;
    updateMenuPosition();
  }, [menuOpen, mounted]);

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
  }, [menuOpen]);

  return (
    <div
      className="
      group relative bg-[#1e2022] border border-[#222426] rounded-2xl
      overflow-visible cursor-pointer
      transition-all duration-150
      hover:border-[#2a2c2e] hover:-translate-y-0.5
      hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]
    "
    >
      <div className="overflow-hidden rounded-2xl" onClick={() => onTap()}>
        {/* Preview */}
        <div className="relative aspect-[4/3] bg-[#f5f6f7] flex items-center justify-center overflow-hidden">
          {isFavourite && (
            <div
              className="
                absolute right-2 top-2 z-10 inline-flex items-center gap-1
                rounded-full bg-[#1a1b1d]/85
                px-2 py-2 text-[11px] font-medium text-[#f1c84c]
                shadow-[0_4px_14px_rgba(0,0,0,0.28)]
                backdrop-blur-sm
              "
            >
              <Star size={11} className="fill-current" />
            </div>
          )}

          {thumbnail ? (
            <img
              src={thumbnail}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText size={28} className="text-[#c8cdd3]" />
          )}

          {/* Hover overlay */}
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
              p-1 w-[160px]
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
          </div>,
          document.body,
        )}
    </div>
  );
}
