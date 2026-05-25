import ReviewDocumentPage from "@/lib/features/review/component/review_document_page";

export default async function ReviewDocumentRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { fileId?: string; mode?: "reviewable" | "reviewed" };
}) {
  const { id } = await params;
  const { fileId, mode } = (await searchParams) ?? {};
  return (
    <ReviewDocumentPage
      documentSupervisorId={id}
      fileId={fileId}
      mode={mode}
    />
  );
}
