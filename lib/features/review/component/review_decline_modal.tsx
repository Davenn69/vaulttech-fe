"use client";

import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type ReviewDeclineModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void | Promise<void>;
  isLoading?: boolean;
};

export default function ReviewDeclineModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: ReviewDeclineModalProps) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedComment = comment.trim();
    if (!trimmedComment || isLoading) {
      return;
    }

    await onSubmit(trimmedComment);
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-decline-modal-title"
        className="w-full max-w-lg rounded-3xl border border-[#2a2c2e] bg-[#16181a] p-5 text-[#e8e9ea] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="review-decline-modal-title"
              className="text-base font-semibold tracking-tight"
            >
              Decline document
            </h2>
            <p className="text-sm leading-6 text-[#8b9096]">
              Add a comment so the file owner knows why this document was
              declined.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2c2e] bg-transparent text-[#c5cad0] transition-colors hover:bg-[#1f2124]"
            aria-label="Close decline modal"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#c5cad0]">Comment</span>
            <textarea
              autoFocus
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Example: Please fix the file naming format and add the requested attachment."
              rows={5}
              className="w-full resize-none rounded-2xl border border-[#2a2c2e] bg-[#111213] px-4 py-3 text-sm text-[#f1f3f5] outline-none transition-colors placeholder:text-[#5f656d] focus:border-[#6c5ce7]"
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#2a2c2e] bg-transparent px-4 py-2.5 text-sm font-medium text-[#c5cad0] transition-colors hover:bg-[#1f2124]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !comment.trim()}
              className="rounded-xl bg-[#ff6b6b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff7f7f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Declining..." : "Decline document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
