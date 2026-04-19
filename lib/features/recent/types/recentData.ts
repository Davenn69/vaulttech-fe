import { FileModel } from "../../home/types/file";
import { FolderModel } from "../../home/types/folder";

export type RecentFileItem = FileModel & {
  createdAt: string;
  updatedAt: string | null;
  itemType: "file";
};

export type RecentFolderItem = Omit<FolderModel, "updatedBy"> & {
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  itemType: "folder";
};

export type RecentData = {
  date: string;
  file: RecentFileItem[];
  folder: RecentFolderItem[];
};
