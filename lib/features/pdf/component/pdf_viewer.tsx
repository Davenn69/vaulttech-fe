"use client";

import PageWrapper from "@/lib/cores/components/page_wrapper";
import PdfViewerHeader from "./pdf_viewer_header";
import usePdfFileNameEditor from "../hooks/usePdfFileNameEditor";
import usePdf from "../hooks/usePdf";
import { useRouter } from "next/navigation";

type PdfViewerProps = {
  id: string;
};

export default function PdfViewer({ id }: PdfViewerProps) {
  const router = useRouter();
  const { loading, downloadUrl, pdfUrl, fileName, fetchPdf, renameFile } =
    usePdf(id);
  const {
    activeDocumentName,
    cancelRename,
    documentName,
    isEditingName,
    nameInputRef,
    renaming,
    setDocumentName,
    beginRename,
    submitRename,
  } = usePdfFileNameEditor({
    id,
    fileName,
    renameFile,
  });

  return (
    <PageWrapper isLoading={loading} className="min-h-dvh">
      <main className="flex min-h-dvh flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PdfViewerHeader
            activeDocumentName={activeDocumentName}
            documentName={documentName}
            isEditingName={isEditingName}
            renaming={renaming}
            downloadUrl={downloadUrl}
            pdfUrl={pdfUrl}
            onBeginRename={beginRename}
            onCancelRename={cancelRename}
            onDocumentNameChange={setDocumentName}
            onReload={() => void fetchPdf(id)}
            onSubmitRename={submitRename}
            onBack={() => router.back()}
            nameInputRef={nameInputRef}
          />

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1200px] flex-col gap-4">
              <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-[#222426] bg-[#0f1011]">
                {pdfUrl ? (
                  <iframe
                    title={fileName || "PDF document"}
                    src={pdfUrl}
                    className="h-full w-full bg-white"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[#7a7d82]">
                    PDF belum tersedia. Coba reload atau pastikan backend
                    mengembalikan file PDF yang bisa diambil sebagai blob.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
