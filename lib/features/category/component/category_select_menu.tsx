"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCategories } from "../hooks/useCategories";

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
  const { categories, loading, fetchCategories, assignFileCategory, createCategory } =
    useCategories(onSuccess);
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/45 px-4">
      <div
        data-category-menu-root
        className="w-full max-w-sm rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#e8e9ea]">
              Set Category
            </p>
            <p className="mt-1 text-xs text-[#7a7d82]">{fileName}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs text-[#7a7d82] transition-colors hover:bg-[#252729] hover:text-[#e8e9ea]"
          >
            Close
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-dashed border-[#2a2c2e] bg-[#202224] p-3">
          {!isAddingCategory ? (
            <div className="space-y-3">
              <button
                onClick={() => setIsAddingCategory(true)}
                className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-sm text-[#e8e9ea] transition-colors hover:text-white"
              >
                <span>Add new category</span>
                <span className="text-xs text-[#7a7d82]">Create</span>
              </button>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#7a7d82]">
                  Status color
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => {
                    const isActive = selectedColor === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`h-8 w-8 rounded-full border transition-all ${
                          isActive
                            ? "scale-110 border-white ring-2 ring-white/20"
                            : "border-[#2a2c2e]"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Choose status color ${color}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddCategory} className="space-y-2">
              <input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Category name"
                className="w-full rounded-lg border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-2 text-sm text-[#e8e9ea] outline-none transition-colors placeholder:text-[#60656b] focus:border-[#3a3c3e]"
              />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#7a7d82]">
                  Status color
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => {
                    const isActive = selectedColor === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`h-8 w-8 rounded-full border transition-all ${
                          isActive
                            ? "scale-110 border-white ring-2 ring-white/20"
                            : "border-[#2a2c2e]"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Choose status color ${color}`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#111] transition-transform hover:scale-[1.01]"
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-[#7a7d82] transition-colors hover:bg-[#252729] hover:text-[#e8e9ea]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
                  onClick={async () => {
                    await assignFileCategory({
                      id: fileId,
                      categoryId: category.id,
                      color: selectedColor,
                    });
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#2a2c2e] bg-[#202224] px-3 py-2 text-left text-sm text-[#e8e9ea] transition-colors hover:border-[#3a3c3e] hover:bg-[#252729]"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: category.color || selectedColor }}
                    />
                    <span className="truncate">{category.name}</span>
                  </span>
                  <span className="text-xs text-[#7a7d82]">Select</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-[#2a2c2e] bg-[#202224] px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-white/20"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-xs text-[#7a7d82]">Selected status color</span>
            <span className="ml-auto text-xs font-medium text-[#e8e9ea]">
              {selectedColor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
