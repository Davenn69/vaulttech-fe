import HomeLayoutClient from "@/lib/features/home/component/home_client";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayoutClient>{children}</HomeLayoutClient>;
}
