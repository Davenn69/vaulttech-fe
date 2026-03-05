"use client";

import { FolderOpen, Clock, Star, Trash2, Plus } from "lucide-react";

const navItems = [
  { icon: FolderOpen, label: "My Repository", id: "repository" },
  { icon: Clock,      label: "Recent",        id: "recent"     },
  { icon: Star,       label: "Favourites",    id: "favourites" },
  { icon: Trash2,     label: "Trash",         id: "trash"      },
];

export default function Sidebar({ activeItem, onNavigate }) {
  return (
    <aside className="w-[200px] shrink-0 flex flex-col h-full px-4 py-6 border-r border-[#222426] bg-[#111213]">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-9 px-1">
        <span className="text-[#6c5ce7] text-lg leading-none">✦</span>
        <span className="font-bold text-[18px] tracking-tight font-sans">
          <span className="text-[#6c5ce7]">Vault</span>
          <span className="text-[#fd7c5a]">tech</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`
              flex items-center gap-2.5 px-3 py-[9px] rounded-xl
              text-[13.5px] text-left w-full transition-all duration-150
              ${activeItem === id
                ? "bg-[#252729] text-[#e8e9ea] font-medium"
                : "text-[#7a7d82] hover:bg-[#252729] hover:text-[#e8e9ea]"
              }
            `}
          >
            <Icon
              size={16}
              className={activeItem === id ? "text-[#6c5ce7]" : ""}
            />
            {label}
          </button>
        ))}
      </nav>

      {/* Add Button */}
      <div className="pt-4">
        <button className="
          flex items-center justify-center gap-2 w-full py-[10px]
          bg-[#6c5ce7] hover:bg-[#7d6ef0] active:translate-y-0
          text-white rounded-xl text-[13.5px] font-semibold tracking-wide
          transition-all duration-150 hover:-translate-y-px
        ">
          <Plus size={16} />
          Add
        </button>
      </div>

    </aside>
  );
}
