export type SearchItem = {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  path: string;
  isFavourite: boolean;
  isDeleted: boolean;
  itemType: "folder" | "file";
  extension?: string | null;
  size?: number | null;
  folderId?: string | null;
};
