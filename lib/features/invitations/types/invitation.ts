import { FileModel } from "../../home/types/file";

export type InvitationStatus = "pending" | "accepted" | "declined";

export type InvitationItem = {
  invitation: InvitationModel;
  file: FileModel;
};

export type InvitationModel = {
  id: string;
  fileId: string;
  supervisorId: string;
  status: InvitationAction;
  invitedBy: string;
  invitedAt: string;
  respondedAt: string;
};

export type InvitationAction = "accept" | "rejected" | "pending";
