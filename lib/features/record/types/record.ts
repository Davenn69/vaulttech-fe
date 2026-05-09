import { FileModel } from "../../home/types/file";

export type RevisionEntry = {
  id: string;
  fileId: string;
  versionNumber: number;
  createdAt: string;
  size?: number;
};

export type RecordPageData = {
  file: FileModel;
  revisions: RevisionEntry[];
};
