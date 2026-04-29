import ExcelEditor from "@/lib/features/excel/components/excel_editor";

export default async function ExcelPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <ExcelEditor workbookId={id} />;
}
