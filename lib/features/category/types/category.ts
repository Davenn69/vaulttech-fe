import { FileModel } from "../../home/types/file";

export type CategoryModel = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  approvalRequired: boolean;
  approvalRole: string;
};

export type CategorizedFile = {
  name: string;
  file: FileModel[];
};
