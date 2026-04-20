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
};

export type DownloadFileUrl = {
  name: string;
  size: number;
  downloadUrl: string;
};
