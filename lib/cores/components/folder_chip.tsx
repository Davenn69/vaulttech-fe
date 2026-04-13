"use client";

import { Folder, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type FolderChipType = {
  name: string;
  onDeleteTap: () => void;
};

export default function FolderChip({ name, onDeleteTap }: FolderChipType) {
  const menuItems = [
    { label: "Open", danger: false, onTap: () => {} },
    { label: "Rename", danger: false, onTap: () => {} },
    { label: "Move to Trash", danger: true, onTap: onDeleteTap },
  ];

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
      className="
      flex items-center justify-between gap-2
      bg-[#1a1b1d] border border-[#2a2c2e] rounded-md
      px-2.5 py-[7px] min-w-[130px]
      hover:border-[#3a3c3e] transition-colors duration-150
    "
    >
      {/* Left */}
      <div className="flex items-center gap-2 overflow-hidden">
        <Folder size={14} className="text-[#fd7c5a] shrink-0" />
        <span className="text-[12.5px] text-[#e8e9ea] truncate">{name}</span>
      </div>

      {/* More menu */}
      <div className="relative shrink-0" ref={ref}>
        <button
          onClick={() => setOpen((p) => !p)}
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
                onClick={() => {
                  setOpen(false);
                  onTap();
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
