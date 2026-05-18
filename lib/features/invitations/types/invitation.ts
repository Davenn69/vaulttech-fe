export type InvitationStatus = "pending" | "accepted" | "declined";

export type InvitationItem = {
  id: string;
  teamName: string;
  inviterName: string;
  role: string;
  repositoryName: string;
  message: string;
  sentAt: string;
  status: InvitationStatus;
  decidedAt?: string;
};

export type InvitationAction = "accept" | "decline";
