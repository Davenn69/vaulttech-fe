import InvitationShell from "@/lib/features/invitations/component/invitation_shell";

export default function InvitationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InvitationShell>{children}</InvitationShell>;
}
