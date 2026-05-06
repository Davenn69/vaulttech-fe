import type { JSONContent } from "@tiptap/react";
import { FileModel } from "../../home/types/file";

export type WordContent = {
  content: JSONContent;
  file: FileModel;
};
