import RepositoryGrid from "@/lib/cores/components/repository_grid";

export default async function HomePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <RepositoryGrid id={id} />;
}
