import PowerpointViewer from "@/lib/features/powerpoint/component/powerpoint_viewer";

export default async function PowerpointPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <PowerpointViewer id={id} />;
}
