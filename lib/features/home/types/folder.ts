export type FolderModel = {
  id: string;
  userId: string;
  parentId: string;
  name: string;
  createdBy: string;
  updatedBy: string;
  path: string;
  isFavourite: boolean;
  isDeleted: boolean;
};
