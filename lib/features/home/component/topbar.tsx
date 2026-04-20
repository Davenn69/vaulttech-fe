"use client";

import {
  FileText,
  Folder,
  Loader2,
  RotateCcw,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearch } from "../hooks/useSearch";

type TopbarType = {
  onUploadToggle: () => void;
};

export default function Topbar({ onUploadToggle }: TopbarType) {
  const router = useRouter();
  const { query, setQuery, results, loading, clearSearch } = useSearch();
  const hasQuery = query.trim().length > 0;

  return (
    <header className="relative flex items-center gap-3 border-b border-[#222426] bg-[#111213] px-6 py-4">
      {/* Search */}
      <div className="relative flex flex-1 items-center">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 text-[#4a4d52]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files and folders..."
          className="
            w-full rounded-xl border border-[#2a2c2e] bg-[#1a1b1d]
            py-[9px] pl-9 pr-4 text-[13.5px] text-[#e8e9ea]
            placeholder-[#4a4d52] outline-none transition-all duration-150
            focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.18)]
            font-sans
          "
        />

        {hasQuery && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d] shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="max-h-[320px] overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#7a7d82]">
                  <Loader2 size={14} className="animate-spin" />
                  Searching...
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="px-3 py-2 text-xs text-[#7a7d82]">
                  No results found.
                </div>
              )}

              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    clearSearch();

                    if (item.itemType === "folder") {
                      router.push(`/repo/${item.id}`);
                      return;
                    }

                    if (item.parentId) {
                      router.push(`/repo/${item.parentId}`);
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#252729]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#252729] text-[#e8e9ea]">
                    {item.itemType === "folder" ? (
                      <Folder size={16} className="text-[#fd7c5a]" />
                    ) : (
                      <FileText size={16} className="text-[#6c5ce7]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-[#e8e9ea]">
                        {item.name}
                      </span>
                      <span className="rounded-full bg-[#252729] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#7a7d82]">
                        {item.itemType}
                      </span>
                    </div>
                    <p className="truncate text-xs text-[#7a7d82]">
                      {item.path || "/"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUploadToggle}
          className="
            flex h-9 w-9 items-center justify-center rounded-xl
            text-[#7a7d82] transition-all duration-150
            hover:bg-[#252729] hover:text-[#e8e9ea]
          "
        >
          <RotateCcw size={18} />
        </button>

        <button
          className="
            flex h-9 w-9 items-center justify-center rounded-xl
            border border-[#2a2c2e] bg-[#1a1b1d]
            text-[#7a7d82] transition-all duration-150
            hover:bg-[#252729] hover:text-[#e8e9ea]
          "
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
