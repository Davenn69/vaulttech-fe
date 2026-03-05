"use client";

import { MoreHorizontal, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const menuItems = [
  { label: "Open",     danger: false },
  { label: "Rename",   danger: false },
  { label: "Download", danger: false },
  { label: "Delete",   danger: true  },
];

export default function FileCard({ name = "Outline.docx", thumbnail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="
      group bg-[#1e2022] border border-[#222426] rounded-2xl
      overflow-hidden cursor-pointer
      transition-all duration-150
      hover:border-[#2a2c2e] hover:-translate-y-0.5
      hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]
    ">
      {/* Preview */}
      <div className="relative aspect-[4/3] bg-[#f5f6f7] flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
        ) : (
          <FileText size={28} className="text-[#c8cdd3]" />
        )}

        {/* Hover overlay */}
        <div className="
          absolute inset-0 bg-black/35 flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
        ">
          <button className="
            px-[18px] py-[7px] bg-white text-[#111] rounded-full
            text-xs font-semibold transition-transform duration-100 hover:scale-105
          ">
            Open
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between px-3 py-[9px] bg-[#1e2022]">
        <span className="text-xs text-[#7a7d82] truncate flex-1">{name}</span>

        {/* Dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
            className="
              flex items-center justify-center w-6 h-6 rounded
              text-[#4a4d52] hover:bg-[#252729] hover:text-[#7a7d82]
              transition-all duration-100
            "
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className="
              absolute right-0 top-[calc(100%+4px)] z-50
              bg-[#1a1b1d] border border-[#2a2c2e] rounded-xl
              p-1 min-w-[130px]
              shadow-[0_8px_24px_rgba(0,0,0,0.4)]
            ">
              {menuItems.map(({ label, danger }) => (
                <button
                  key={label}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    block w-full px-2.5 py-[7px] text-left text-[13px] rounded-lg
                    transition-all duration-100
                    ${danger
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
    </div>
  );
}
