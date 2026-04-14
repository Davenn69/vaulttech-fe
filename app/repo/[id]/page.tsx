import RepositoryGrid from "@/lib/features/home/component/repository_grid";

export default async function HomePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <RepositoryGrid id={id} />;
}
