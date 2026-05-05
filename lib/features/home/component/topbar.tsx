"use client";

import {
  FileText,
  Folder,
  Loader2,
  RotateCcw,
  Search,
  User,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "../hooks/useSearch";
import { PageRoutes } from "@/lib/cores/utils/navigation";
import { supabase } from "@/lib/cores/utils/supabase";
import { folderStorage } from "@/lib/cores/utils/local";

type TopbarType = {
  onUploadToggle: () => void;
};

export default function Topbar({ onUploadToggle }: TopbarType) {
  const router = useRouter();
  const { query, setQuery, results, loading } = useSearch();
  const hasQuery = query.trim().length > 0;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasQuery) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [hasQuery]);

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await supabase.auth.signOut();
    folderStorage.clearParentFolderId();
    router.replace("/auth/login");
  };

  return (
    <header className="relative flex items-center gap-3 border-b border-[#222426] bg-[#111213] px-6 py-4">
      {/* Search */}
      <div ref={searchRef} className="relative flex flex-1 items-center">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 text-[#4a4d52]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const nextValue = e.target.value;
            setQuery(nextValue);
            setIsDropdownOpen(nextValue.trim().length > 0);
          }}
          onFocus={() => {
            if (hasQuery) setIsDropdownOpen(true);
          }}
          placeholder="Search files and folders..."
          className="
            w-full rounded-xl border border-[#2a2c2e] bg-[#1a1b1d]
            py-[9px] pl-9 pr-4 text-[13.5px] text-[#e8e9ea]
            placeholder-[#4a4d52] outline-none transition-all duration-150
            focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.18)]
            font-sans
          "
        />

        {hasQuery && isDropdownOpen && (
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
                    if (item.itemType === "folder") {
                      router.push(PageRoutes.repositoryFolder(item.id));
                      setIsDropdownOpen(false);
                      return;
                    }

                    if (item.parentId) {
                      router.push(PageRoutes.repositoryFolder(item.parentId));
                      setIsDropdownOpen(false);
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
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          className="
            flex h-9 w-9 items-center justify-center rounded-xl
            border border-[#2a2c2e] bg-[#1a1b1d]
            text-[#7a7d82] transition-all duration-150
            hover:bg-[#252729] hover:text-[#e8e9ea]
          "
        >
          <User size={16} />
        </button>

        {isUserMenuOpen && (
          <div
            ref={userMenuRef}
            className="
              absolute right-6 top-[calc(100%+8px)] z-50 w-44 overflow-hidden
              rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d]
              shadow-[0_16px_40px_rgba(0,0,0,0.45)]
            "
          >
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center gap-2 px-4 py-3 text-left text-sm
                text-[#e8e9ea] transition-colors hover:bg-[#252729]
              "
            >
              <LogOut size={16} className="text-[#fd7c5a]" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
