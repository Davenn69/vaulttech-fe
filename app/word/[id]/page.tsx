import WordEditor from "@/lib/features/word/component/word_editor";

export default async function WordPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <WordEditor id={id} />;
}
