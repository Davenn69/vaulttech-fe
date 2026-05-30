"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { Check, Palette, Plus, X } from "lucide-react";

type CategorySelectMenuProps = {
  open: boolean;
  fileId: string;
  fileName: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CategorySelectMenu({
  open,
  fileId,
  fileName,
  onClose,
  onSuccess,
}: CategorySelectMenuProps) {
  const {
    categories,
    loading,
    fetchCategories,
    assignFileCategory,
    createCategory,
  } = useCategories(onSuccess);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#5b8cff");

  const colorPresets = useMemo(
    () => [
      "#5b8cff",
      "#7c3aed",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#14b8a6",
      "#ec4899",
      "#64748b",
    ],
    [],
  );

  useEffect(() => {
    if (!open) return;

    fetchCategories();
  }, [fetchCategories, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handler = (event: MouseEvent) => {
      if (event.target instanceof HTMLElement) {
        const target = event.target.closest("[data-category-menu-root]");

        if (!target) {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, open]);

  if (!open) return null;

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    await createCategory({ name: trimmedName, color: selectedColor });
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[1px]">
      <div
        data-category-menu-root
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[#2a2c2e] bg-[#151618] shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
      >
        <div className="border-b border-[#222426] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#f4f5f6]">
                Set Category
              </p>
              <p className="mt-1 text-xs leading-5 text-[#7a7d82]">
                {fileName}
              </p>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2c2e] bg-transparent text-[#a6abb2] transition-colors hover:bg-[#252729] hover:text-[#f4f5f6]"
              aria-label="Close category menu"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-2xl border border-[#2a2c2e] bg-[#1b1d20] p-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
                style={{
                  backgroundColor: selectedColor,
                  boxShadow: `0 0 0 4px ${selectedColor}22`,
                }}
              >
                <Palette size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7a7d82]">
                  Selected status color
                </p>
                <p className="mt-1 text-sm font-medium text-[#f4f5f6]">
                  {selectedColor}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a2c2e] bg-[#1b1d20] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#f4f5f6]">
                  Add new category
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isAddingCategory
                    ? "bg-[rgba(91,140,255,0.16)] text-[#dbe5ff] ring-1 ring-[rgba(91,140,255,0.28)]"
                    : "bg-[#111213] text-[#f4f5f6] hover:bg-[#252729]"
                }`}
              >
                <Plus size={14} />
                Create
              </button>
            </div>

            {!isAddingCategory ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#f4f5f6]">
                    Ready to create a category
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#7a7d82]">
                    Klik Create untuk membuka form dan menyesuaikan warna.
                  </p>
                </div>
                <div
                  className="h-10 w-10 shrink-0 rounded-2xl border border-white/10"
                  style={{
                    backgroundColor: selectedColor,
                    boxShadow: `0 0 0 4px ${selectedColor}1a`,
                  }}
                  aria-hidden="true"
                />
              </div>
            ) : (
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Category name"
                  className="w-full rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3 text-sm text-[#f4f5f6] outline-none transition-colors placeholder:text-[#60656b] focus:border-[#5b8cff]"
                />

                <div className="rounded-2xl border border-[#2a2c2e] bg-[#111213] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7a7d82]">
                      Status color
                    </p>
                    <span
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[#dbe5ff]"
                      style={{ backgroundColor: `${selectedColor}20` }}
                    >
                      {selectedColor}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map((color) => {
                      const isActive = selectedColor === color;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`relative h-11 rounded-2xl border transition-all duration-150 ${
                            isActive
                              ? "scale-[1.02] border-white/60 ring-2 ring-white/10"
                              : "border-[#2a2c2e] hover:border-[#3a3c3e]"
                          }`}
                          style={{
                            backgroundColor: color,
                            boxShadow: isActive
                              ? `0 0 0 4px ${color}22`
                              : "none",
                          }}
                          aria-label={`Choose status color ${color}`}
                        >
                          {isActive ? (
                            <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10 text-white">
                              <Check size={16} strokeWidth={3} />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#111] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading || !newCategoryName.trim()}
                    style={{
                      backgroundColor: selectedColor,
                    }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-white/85" />
                    {loading ? "Saving..." : "Save category"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName("");
                    }}
                    className="rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3 text-sm text-[#a6abb2] transition-colors hover:bg-[#252729] hover:text-[#f4f5f6]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="rounded-2xl border border-[#2a2c2e] bg-[#1b1d20] p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f4f5f6]">
                  Available categories
                </p>
              </div>
              <span className="rounded-full border border-[#2a2c2e] bg-[#111213] px-2.5 py-1 text-[11px] text-[#a6abb2]">
                {categories.length} items
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2a2c2e] scrollbar-track-transparent">
              {loading && categories.length === 0 ? (
                <div className="py-4 text-sm text-[#7a7d82]">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="py-4 text-sm text-[#7a7d82]">
                  No category available.
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={async () => {
                        await assignFileCategory({
                          id: fileId,
                          categoryId: category.id,
                          color: category.color || selectedColor,
                        });
                        onClose();
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#2a2c2e] bg-[#111213] px-3 py-3 text-left text-sm text-[#f4f5f6] transition-all duration-150 hover:-translate-y-[1px] hover:border-[#3a3c3e] hover:bg-[#202226]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="rounded-full border border-[#2a2c2e] bg-[#1b1d20] px-2.5 py-1 text-xs text-[#a6abb2]">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
