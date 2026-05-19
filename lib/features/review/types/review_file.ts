import { FileModel } from "@/lib/features/home/types/file";
import { InvitationModel } from "../../invitations/types/invitation";

export type ReviewFileModel = {
  file: FileModel;
  invitation: InvitationModel;
};
