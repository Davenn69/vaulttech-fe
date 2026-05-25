import { FileModel } from "@/lib/features/home/types/file";
import { InvitationModel } from "@/lib/features/invitations/types/invitation";

export type ReviewFileModel = {
  file: FileModel;
  invitation: InvitationModel;
};

export type ReviewModel = {
  reviewableFiles: ReviewFileModel[];
  reviewedFiles: ReviewFileModel[];
};

export type ReviewDetailModel = {
  file: FileModel;
  url: string;
};

export type CommentModel = {
  id: string;
  supervisorId?: string;
  status: string;
  documentSupervisorId?: string;
  comment: string;
  createdAt: string;
  createdBy: string;
  creator: CreatorModel;
};

export type CreatorModel = {
  id: string;
  username: string;
};

export type ReviewCommentsModel = {
  file: FileModel;
  comments: CommentModel[];
};
