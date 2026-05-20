import ReviewDocumentPage from "@/lib/features/review/component/review_document_page";

export default async function ReviewDocumentRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { fileId?: string };
}) {
  const { id } = await params;
  const { fileId } = await searchParams!;
  return <ReviewDocumentPage documentSupervisorId={id} fileId={fileId} />;
}
