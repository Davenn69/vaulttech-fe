"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useState, type ElementType } from "react";

type SidebarNavItem = {
  icon: ElementType;
  label: string;
  id: string;
  onTap: () => void | Promise<void>;
};

type SidebarProps = {
  activeItem: string;
  onUploadFiles: (files: File[]) => Promise<void> | void;
  onCreateFolder: () => void;
  onNavigate: (id: string) => void;
  onCreateWordFile: () => void;
  onCreateExcelFile: () => void;
  navItems: SidebarNavItem[];
};

export default function Sidebar({
  activeItem,
  onUploadFiles,
  onCreateFolder,
  onNavigate,
  navItems,
  onCreateWordFile,
  onCreateExcelFile,
}: SidebarProps) {
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

        input.onchange = async () => {
          const selectedFiles: File[] = input.files
            ? Array.from(input.files)
            : [];
          if (!selectedFiles.length) return;

          await onUploadFiles(selectedFiles);
        };

        input.click();
      },
    },
    {
      label: "Word",
      iconRoute: "/assets/icons/Word_Icon.svg",
      onClick: () => {
        onCreateWordFile();
      },
    },
    {
      label: "Excel",
      iconRoute: "/assets/icons/Excel_Icon.svg",
      onClick: () => {
        onCreateExcelFile();
      },
    },
  ];

  return (
    <aside className="flex h-full w-[200px] shrink-0 flex-col border-r border-[#222426] bg-[#111213] px-4 py-6">
      <div className="mb-9 flex items-center gap-2 px-1">
        <span className="text-lg leading-none text-[#6c5ce7]">*</span>
        <span className="font-sans text-[18px] font-bold tracking-tight">
          <span className="text-[#6c5ce7]">Vault</span>
          <span className="text-[#fd7c5a]">tech</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ icon: Icon, label, id, onTap }) => (
          <button
            key={id}
            onClick={async () => {
              await onTap();
              onNavigate(id);
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-[9px] text-left text-[13.5px] transition-all duration-150 ${
              activeItem === id
                ? "bg-[#252729] font-medium text-[#e8e9ea]"
                : "text-[#7a7d82] hover:bg-[#252729] hover:text-[#e8e9ea]"
            }`}
          >
            <Icon
              size={16}
              className={activeItem === id ? "text-[#6c5ce7]" : ""}
            />
            {label}
          </button>
        ))}
      </nav>

      <div className="pt-4">
        <div className="relative shrink-0">
          {addButtonOpen && (
            <div className="absolute right-0 bottom-[calc(100%+16px)] z-50 w-full rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)] animate-[dropIn_0.12s_ease]">
              {buttonItems.map(({ label, iconRoute, onClick }) => (
                <button
                  key={label}
                  onClick={() => {
                    onClick();
                    setAddButtonOpen(false);
                  }}
                  className="block w-full rounded-lg px-2.5 py-[7px] text-left text-[13px] text-[#7a7d82] transition-all duration-100 hover:bg-[#252729] hover:text-[#e8e9ea]"
                >
                  <div className="flex flex-row items-center gap-2">
                    <Image width={24} height={24} src={iconRoute} alt={label} />
                    <p>{label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setAddButtonOpen((prev) => !prev)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6c5ce7] py-[10px] text-[13.5px] font-semibold tracking-wide text-white transition-all duration-150 hover:-translate-y-px hover:bg-[#7d6ef0] active:translate-y-0"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </aside>
  );
}
