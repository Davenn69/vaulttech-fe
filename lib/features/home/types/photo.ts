import { FileModel } from "./file";

export type PhotoModel = {
  file: FileModel;
  signedUrl: string;
};
