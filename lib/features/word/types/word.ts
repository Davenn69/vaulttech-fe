import type { JSONContent } from "@tiptap/react";
import { FileModel } from "../../home/types/file";

export type WordContent = {
  content: JSONContent;
  file: FileModel;
};

export type WordCollaborationDocument = {
  document: JSONContent;
  versionNumber: number;
};

export type WordCollaborationSession = {
  id: string;
  fileId: string;
  userId: string;
  connectionId: string;
  cursorState?: unknown;
  selectionState?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type WordFileResponse = {
  file: FileModel;
  content: JSONContent;
  collaboration: WordCollaborationDocument;
};

export type WordCollaborationResponse = {
  file: FileModel;
  collaboration: WordCollaborationDocument;
};

export type WordJoinCollaborationResponse = {
  file: FileModel;
  session: WordCollaborationSession;
  collaboration: WordCollaborationDocument | null;
};

export type WordSyncCollaborationResponse = {
  file: FileModel;
  collaboration: WordCollaborationDocument;
};
