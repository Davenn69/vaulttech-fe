import ReviewDocumentPage from "@/lib/features/review/component/review_document_page";

export default async function ReviewDocumentRoute({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  return <ReviewDocumentPage id={id} />;
}
