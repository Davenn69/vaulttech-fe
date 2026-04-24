import PdfViewer from "@/lib/features/pdf/component/pdf_viewer";

export default async function PdfPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <PdfViewer id={id} />;
}
