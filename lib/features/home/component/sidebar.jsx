"use client";

import { FolderOpen, Clock, Star, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar({
  activeItem,
  onUploadFiles,
  onCreateFolder,
  onNavigate,
}) {
  const router = useRouter();

  const navItems = [
    {
      icon: FolderOpen,
      label: "My Repository",
      id: "repository",
      onTap: () => {},
    },
    { icon: Clock, label: "Recent", id: "recent", onTap: () => {} },
    { icon: Star, label: "Favourites", id: "favourites", onTap: () => {} },
    {
      icon: Trash2,
      label: "Trash",
      id: "trash",
      onTap: async () => {
        await router.push("/repo/trash");
      },
    },
  ];

  const [addButtonOpen, setAddButtonOpen] = useState(false);

  const buttonItems = [
    {
      label: "Add Folder",
      iconRoute: "/assets/icons/Normal_File_Icon.svg",
      onClick: () => {
        onCreateFolder();
      },
    },
    {
      label: "Upload File",
      iconRoute: "/assets/icons/Normal_File_Icon.svg",
      onClick: () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;

        input.onchange = async (e) => {
          const selectedFiles = Array.from(e.target.files ?? []);
          if (!selectedFiles.length) return;

          await onUploadFiles(selectedFiles);
        };

        input.click();
      },
    },
    {
      label: "Word",
      iconRoute: "/assets/icons/Word_Icon.svg",
      onClick: () => {},
    },
    {
      label: "Excel",
      iconRoute: "/assets/icons/Excel_Icon.svg",
      onClick: () => {},
    },
    {
      label: "Pdf",
      iconRoute: "/assets/icons/Pdf_Icon.svg",
      onClick: () => {},
    },
  ];

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
        {navItems.map(({ icon: Icon, label, id, onTap }) => (
          <button
            key={id}
            onClick={async () => {
              await onTap();
              onNavigate(id);
            }}
            className={`
              flex items-center gap-2.5 px-3 py-[9px] rounded-xl
              text-[13.5px] text-left w-full transition-all duration-150
              ${
                activeItem === id
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
        <div className="relative shrink-0">
          {addButtonOpen && (
            <div
              className="absolute right-0 bottom-[calc(100%+16px)] z-50
              bg-[#1a1b1d] border border-[#2a2c2e] rounded-xl
              p-1 w-full
              shadow-[0_8px_24px_rgba(0,0,0,0.4)]
              animate-[dropIn_0.12s_ease]"
            >
              {buttonItems.map(({ label, iconRoute, onClick }) => (
                <button
                  key={label}
                  onClick={() => {
                    onClick();
                    setAddButtonOpen(false);
                  }}
                  className="block w-full px-2.5 py-[7px] text-left 
                text-[13px] rounded-lg transition-all duration-100
                text-[#7a7d82] hover:bg-[#252729] hover:text-[#e8e9ea]"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <img width={24} height={24} src={iconRoute} />
                    <p>{label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setAddButtonOpen(true)}
            className="
          flex items-center justify-center gap-2 w-full py-[10px]
          bg-[#6c5ce7] hover:bg-[#7d6ef0] active:translate-y-0
          text-white rounded-xl text-[13.5px] font-semibold tracking-wide
          transition-all duration-150 hover:-translate-y-px
        "
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </aside>
  );
}
