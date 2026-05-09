import RecordPage from "@/lib/features/record/components/record_page";

export default async function RecordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <RecordPage id={id} />;
}
