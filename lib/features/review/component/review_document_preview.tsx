/* eslint-disable @next/next/no-img-element */
"use client";

import { ExternalLink, FileText, Image as ImageIcon, RefreshCw, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";
import { getPreviewMode } from "../utils/review_document";

type ReviewDocumentPreviewProps = {
  signedUrl?: string;
  extension?: string;
  fileName?: string;
  loading: boolean;
  onReload: () => void;
};

function PreviewFrame({
  title,
  subtitle,
  loading,
  icon,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#222426] bg-[#151618] p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2a2c2e] bg-[#1a1b1d] text-[#6c5ce7]">
            {icon}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#7a7d82]">
              {title}
            </p>
            <h3 className="mt-1 text-base font-semibold text-[#f6f7f8]">
              {subtitle}
            </h3>
          </div>
        </div>
        {action}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[#2a2c2e] bg-[#111213] px-6 py-12 text-center text-sm text-[#7a7d82]">
          Loading preview...
        </div>
      ) : (
        children
      )}
    </section>
  );
}

export default function ReviewDocumentPreview({
  signedUrl,
  extension,
  fileName,
  loading,
  onReload,
}: ReviewDocumentPreviewProps) {
  const previewMode = getPreviewMode(extension);
  const title =
    previewMode === "image"
      ? "Image preview"
      : previewMode === "pdf"
        ? "PDF preview"
        : "Document preview";
  const subtitle = fileName ?? "Review document";
  const activeName = fileName ?? "Preview file";

  return (
    <PreviewFrame
      title={title}
      subtitle={subtitle}
      loading={loading}
      icon={previewMode === "image" ? <ImageIcon size={18} /> : <FileText size={18} />}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReload}
            className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
          >
            <RefreshCw size={15} />
            Reload
          </button>
          {signedUrl ? (
            <a
              href={signedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm text-[#e8e9ea] transition-colors hover:bg-[#252729]"
            >
              <ExternalLink size={15} />
              Open file
            </a>
          ) : null}
        </div>
      }
    >
      <div className="min-h-[640px] overflow-hidden rounded-2xl border border-[#2a2c2e] bg-[#0b0f14]">
        {signedUrl ? (
          previewMode === "image" ? (
            <div className="flex h-[640px] items-center justify-center bg-[#0b0f14] p-4">
              <img
                src={signedUrl}
                alt={activeName}
                className="max-h-full max-w-full rounded-xl object-contain shadow-[0_20px_70px_rgba(0,0,0,0.4)]"
              />
            </div>
          ) : (
            <iframe
              title={activeName}
              src={signedUrl}
              className="h-[640px] w-full bg-white"
            />
          )
        ) : (
          <div className="flex h-[640px] items-center justify-center p-6 text-center text-sm text-[#7a7d82]">
            <div className="max-w-md">
              <ShieldCheck size={18} className="mx-auto mb-3 text-[#7a7d82]" />
              <p className="font-medium text-[#f6f7f8]">No preview available</p>
              <p className="mt-1 leading-6">
                Signed URL belum tersedia dari backend, jadi file belum bisa
                ditampilkan inline.
              </p>
            </div>
          </div>
        )}
      </div>
    </PreviewFrame>
  );
}
