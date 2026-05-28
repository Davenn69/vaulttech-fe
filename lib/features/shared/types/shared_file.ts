import { FileModel } from "@/lib/features/home/types/file";
import { FolderModel } from "@/lib/features/home/types/folder";

export type SharedFileModel = FileModel & {
  sharedBy?: string;
  sharedAt?: string;
  permissionType?: "read" | "write" | string;
};

export type SharedFolderModel = FolderModel & {
  sharedBy?: string;
  sharedAt?: string;
  permissionType?: "read" | "write" | string;
};
