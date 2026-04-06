"use client";

import { Search, RotateCcw, User } from "lucide-react";
import { useState } from "react";

type TopbarType = {
  onUploadToggle: () => void;
};
export default function Topbar({ onUploadToggle }: TopbarType) {
  const [query, setQuery] = useState("");

  return (
    <header className="flex items-center gap-3 px-6 py-4 border-b border-[#222426] bg-[#111213]">
      {/* Search */}
      <div className="flex-1 relative flex items-center">
        <Search
          size={15}
          className="absolute left-3 text-[#4a4d52] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files and folders..."
          className="
            w-full pl-9 pr-4 py-[9px]
            bg-[#1a1b1d] border border-[#2a2c2e] rounded-xl
            text-[#e8e9ea] text-[13.5px] placeholder-[#4a4d52]
            outline-none transition-all duration-150
            focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.18)]
            font-sans
          "
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUploadToggle}
          className="
          flex items-center justify-center w-9 h-9 rounded-xl
          text-[#7a7d82] hover:bg-[#252729] hover:text-[#e8e9ea]
          transition-all duration-150
        "
        >
          <RotateCcw size={18} />
        </button>

        <button
          className="
          flex items-center justify-center w-9 h-9 rounded-xl
          bg-[#1a1b1d] border border-[#2a2c2e]
          text-[#7a7d82] hover:bg-[#252729] hover:text-[#e8e9ea]
          transition-all duration-150
        "
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
