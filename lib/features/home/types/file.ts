import { CategoryModel } from "../../category/types/category";

export type FileModel = {
  id: string;
  userId: string;
  folderId: string;
  name: string;
  createdBy: string;
  extension: string;
  size: number;
  path: string;
  isFavourite: boolean;
  isDeleted: boolean;
  category?: CategoryModel;
};

export type DownloadFileUrl = {
  name: string;
  size: number;
  downloadUrl: string;
};
