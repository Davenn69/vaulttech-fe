const STORAGE_KEY = "vaulttech_parent_folder_id";

export const folderStorage = {
  setParentFolderId(id: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, id);
  },

  getParentFolderId() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  },

  clearParentFolderId() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
