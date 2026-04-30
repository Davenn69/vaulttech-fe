"use client";

import { Folder, MoreVertical, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MenuItemType } from "../types/menu_item_type";

type FolderChipType = {
  name: string;
  onTap: () => void;
  menuItems: MenuItemType[];
  isFavourite?: boolean;
};

export default function FolderChip({
  name,
  onTap,
  menuItems,
  isFavourite,
}: FolderChipType) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;

      if (ref.current && target && !ref.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(event) => {
        if (!onTap) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onTap();
        }
      }}
      className="
      flex items-center justify-between gap-2
      bg-[#1a1b1d] border border-[#2a2c2e] rounded-md
      px-2.5 py-[7px] min-w-[130px]
      hover:border-[#3a3c3e] transition-colors duration-150
      cursor-pointer
    "
    >
      {/* Left */}
      <div className="flex items-center gap-2 overflow-hidden">
        <Folder size={14} className="text-[#fd7c5a] shrink-0" />
        <span className="text-[12.5px] text-[#e8e9ea] truncate">{name}</span>
        {isFavourite && (
          <Star size={10} className="fill-current text-[#f1c84c]" />
        )}
      </div>

      {/* More menu */}
      <div className="relative shrink-0" ref={ref}>
        <button
          onClick={(event) => {
            event.stopPropagation();
            setOpen((p) => !p);
          }}
          className="
            flex items-center justify-center w-6 h-6 rounded
            text-[#4a4d52] hover:bg-[#252729] hover:text-[#7a7d82]
            transition-all duration-100
          "
        >
          <MoreVertical size={14} />
        </button>

        {open && (
          <div
            className="
            absolute right-0 top-[calc(100%+4px)] z-50
            bg-[#1a1b1d] border border-[#2a2c2e] rounded-xl
            p-1 min-w-[130px]
            shadow-[0_8px_24px_rgba(0,0,0,0.4)]
            animate-[dropIn_0.12s_ease]
          "
          >
            {menuItems.map(({ label, danger, onTap }) => (
              <button
                key={label}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                  onTap?.();
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
          </div>
        )}
      </div>
    </div>
  );
}
