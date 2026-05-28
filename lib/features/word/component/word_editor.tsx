"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Code,
  Download,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import useWord from "../hooks/useWord";
import {
  EMPTY_DOCUMENT,
  normalizeEditorContent,
  toRtfDocument,
} from "../utils/word_editor_utils";

export default function WordEditor({ id }: { id: string }) {
  const {
    loading,
    saving,
    collaborationLoading,
    content,
    fileName,
    collaboration,
    sessionId,
    fetchCollaboration,
    syncCollaboration,
    saveContent,
    renameFile,
  } = useWord(id);
  const [documentName, setDocumentName] = useState("Document");
  const [isEditingName, setIsEditingName] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const previousNameRef = useRef("Document");
  const [, setEditorTick] = useState(0);
  const lastAppliedRemoteContentRef = useRef<string | undefined>("");
  const pendingSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const autosyncInFlightRef = useRef(false);
  const lastSavedSignatureRef = useRef<string>("");
  const editorRef = useRef<Editor | null>(null);
  const activeDocumentName = fileName ?? documentName;

  useEffect(() => {
    if (!fileName) return;

    setDocumentName(fileName);
    previousNameRef.current = fileName;
    document.title = `${fileName} - Word editor`;
  }, [fileName]);

  useEffect(() => {
    if (!isEditingName) return;

    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [isEditingName]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4, 5, 6],
          },
          codeBlock: {
            HTMLAttributes: {
              class: "word-code-block",
            },
          },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
        }),
      ],
      immediatelyRender: false,
      content: content ?? EMPTY_DOCUMENT,
      editorProps: {
        attributes: {
          class:
            "min-h-[540px] w-full rounded-3xl border border-[#2a2c2e] bg-[#121315] px-6 py-5 text-[15px] leading-7 text-[#e8e9ea] outline-none focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.15)]",
        },
      },
      onUpdate: ({ editor }) => {
        const nextContent = editor.getJSON();
        const nextSignature = JSON.stringify(nextContent);

        setEditorTick((current) => current + 1);

        if (lastSavedSignatureRef.current === nextSignature) {
          return;
        }

        if (pendingSaveTimeoutRef.current) {
          clearTimeout(pendingSaveTimeoutRef.current);
          pendingSaveTimeoutRef.current = null;
        }

        pendingSaveTimeoutRef.current = setTimeout(() => {
          pendingSaveTimeoutRef.current = null;
          const latestContent = editor.getJSON();
          const latestSignature = JSON.stringify(latestContent);

          if (lastSavedSignatureRef.current === latestSignature) {
            return;
          }

          void (async () => {
            try {
              autosyncInFlightRef.current = true;
              await syncCollaboration(
                id,
                latestContent,
                collaboration?.versionNumber,
              );
              lastSavedSignatureRef.current = latestSignature;
            } catch {
              // syncCollaboration already shows an error toast.
            } finally {
              autosyncInFlightRef.current = false;
            }
          })();
        }, 900);
      },
      onSelectionUpdate: () => {
        setEditorTick((current) => current + 1);
      },
    },
  );

  useEffect(() => {
    editorRef.current = editor;

    return () => {
      if (editorRef.current === editor) {
        editorRef.current = null;
      }
    };
  }, [editor]);

  useEffect(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor || !content) return;

    const nextContent = normalizeEditorContent(content);
    const contentSignature = JSON.stringify(nextContent);
    const editorSignature = JSON.stringify(currentEditor.getJSON());

    if (contentSignature === editorSignature) {
      lastSavedSignatureRef.current = contentSignature;
      return;
    }
    if (lastAppliedRemoteContentRef.current === contentSignature) return;

    if (pendingSaveTimeoutRef.current) {
      clearTimeout(pendingSaveTimeoutRef.current);
      pendingSaveTimeoutRef.current = null;
    }

    lastAppliedRemoteContentRef.current = contentSignature;
    currentEditor.commands.setContent(nextContent, { emitUpdate: false });
    lastSavedSignatureRef.current = contentSignature;
  }, [content, editor]);

  useEffect(
    () => () => {
      if (pendingSaveTimeoutRef.current) {
        clearTimeout(pendingSaveTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!id) return;

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      if (pendingSaveTimeoutRef.current || autosyncInFlightRef.current) {
        return;
      }

      void fetchCollaboration(id, { silent: true });
    }, 3500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchCollaboration, id]);

  const plainText = editor?.getText() ?? "";
  const activeStats = {
    words: plainText.trim() ? plainText.trim().split(/\s+/).length : 0,
    characters: plainText.length,
  };

  const getInlineMarkState = (markName: string) => {
    if (!editor) return false;

    const { selection, storedMarks } = editor.state;

    if (selection.empty) {
      const activeMarks = storedMarks ?? selection.$from.marks();
      return activeMarks.some((mark) => mark.type.name === markName);
    }

    return editor.isActive(markName);
  };

  const getBlockState = (
    name: "heading" | "bulletList" | "orderedList" | "blockquote" | "codeBlock",
    attributes?: Record<string, unknown>,
  ) => {
    if (!editor) return false;

    return editor.isActive(name, attributes);
  };

  const syncCurrentDraft = async () => {
    if (!editor) return;

    const nextContent = editor.getJSON();
    const nextSignature = JSON.stringify(nextContent);

    if (pendingSaveTimeoutRef.current) {
      clearTimeout(pendingSaveTimeoutRef.current);
      pendingSaveTimeoutRef.current = null;
    }

    try {
      autosyncInFlightRef.current = true;
      await saveContent(id, nextContent);
      lastSavedSignatureRef.current = nextSignature;
      toast.success("Document saved");
    } catch {
      return;
    } finally {
      autosyncInFlightRef.current = false;
    }
  };

  const renameCurrentFile = async (nextName: string) => {
    if (!id || renaming) return;

    const trimmedName = nextName.trim();

    if (!trimmedName) {
      toast.error("Nama file tidak boleh kosong");
      return;
    }

    setRenaming(true);

    try {
      await renameFile(id, trimmedName);
      setDocumentName(trimmedName);
      previousNameRef.current = trimmedName;
      document.title = `${trimmedName} - Word editor`;
    } finally {
      setRenaming(false);
    }
  };

  const submitRename = async () => {
    setIsEditingName(false);

    if (documentName === previousNameRef.current) return;

    await renameCurrentFile(documentName);
  };

  const downloadAsWord = () => {
    if (!editor) return;

    const nextTitle = activeDocumentName;
    const rtf = toRtfDocument(nextTitle, editor.getJSON());
    const blob = new Blob([rtf], { type: "application/rtf" });
    const fileName = `${nextTitle.replace(/[\\/:*?"<>|]+/g, "-").trim() || "document"}.rtf`;
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    toast.success("Word-compatible file downloaded");
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor?.chain().focus().toggleBlockquote().run();
  };

  const toggleCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  const toggleLink = () => {
    if (!editor) return;

    const currentUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("Masukkan URL link", currentUrl ?? "");

    if (nextUrl === null) return;

    const trimmed = nextUrl.trim();

    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
  };

  return (
    <PageWrapper isLoading={loading}>
      <main
        className="flex h-full min-h-0 flex-1 overflow-hidden bg-[#111213] text-[#e8e9ea]"
        suppressHydrationWarning
      >
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222426] bg-[#121315] px-5 py-4">
            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  onBlur={() => submitRename()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitRename();
                      return;
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      setDocumentName(previousNameRef.current);
                      setIsEditingName(false);
                    }
                  }}
                  disabled={renaming}
                  className="mt-2 w-full bg-transparent text-2xl font-semibold text-[#f5f6f7] outline-none placeholder:text-[#7a7d82] disabled:opacity-60"
                  placeholder="Nama file"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    previousNameRef.current = activeDocumentName;
                    setIsEditingName(true);
                  }}
                  className="mt-2 block w-full min-w-0 text-left"
                  title="Klik untuk ubah nama file"
                >
                  <h1 className="truncate text-2xl font-semibold text-[#f5f6f7] transition-colors hover:text-white">
                    {activeDocumentName}
                  </h1>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[#222426] bg-[#1a1b1d] px-3 py-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    collaborationLoading
                      ? "bg-amber-400"
                      : collaboration
                        ? "bg-emerald-400"
                        : "bg-slate-500"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
                    Live sync
                  </p>
                  <p className="text-xs font-medium text-[#e8e9ea]">
                    {collaborationLoading
                      ? "Connecting"
                      : collaboration
                        ? `Synced · version ${collaboration.versionNumber}`
                        : "Idle"}
                    {sessionId ? ` · session ${sessionId.slice(0, 8)}` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={syncCurrentDraft}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={downloadAsWord}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                <Download size={15} />
                Download Word
              </button>
            </div>
          </div>

          <div className="border-b border-[#222426] bg-[#111213] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarButton
                active={getInlineMarkState("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                icon={Bold}
                label="Bold"
              />
              <ToolbarButton
                active={getInlineMarkState("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                icon={Italic}
                label="Italic"
              />
              <ToolbarButton
                active={getInlineMarkState("underline")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                icon={UnderlineIcon}
                label="Underline"
              />
              <ToolbarButton
                active={getInlineMarkState("strike")}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                icon={Strikethrough}
                label="Strikethrough"
              />

              <div className="mx-1 h-8 w-px bg-[#222426]" />

              <ToolbarButton
                active={getBlockState("heading", { level: 1 })}
                onClick={() => setHeading(1)}
                icon={Heading1}
                label="Heading 1"
              />
              <ToolbarButton
                active={getBlockState("heading", { level: 2 })}
                onClick={() => setHeading(2)}
                icon={Heading2}
                label="Heading 2"
              />
              <ToolbarButton
                active={getBlockState("heading", { level: 3 })}
                onClick={() => setHeading(3)}
                icon={Heading3}
                label="Heading 3"
              />
              <ToolbarButton
                active={getBlockState("bulletList")}
                onClick={toggleBulletList}
                icon={List}
                label="Bullets"
              />
              <ToolbarButton
                active={getBlockState("orderedList")}
                onClick={toggleOrderedList}
                icon={ListOrdered}
                label="Numbered"
              />
              <ToolbarButton
                active={getBlockState("blockquote")}
                onClick={toggleBlockquote}
                icon={Quote}
                label="Quote"
              />
              <ToolbarButton
                active={getBlockState("codeBlock")}
                onClick={toggleCodeBlock}
                icon={Code}
                label="Code block"
              />
              <ToolbarButton
                active={getInlineMarkState("link")}
                onClick={toggleLink}
                icon={Link2}
                label="Link"
              />

              <div className="mx-1 h-8 w-px bg-[#222426]" />

              <ToolbarButton
                onClick={() => editor?.chain().focus().undo().run()}
                icon={Undo2}
                label="Undo"
              />
              <ToolbarButton
                onClick={() => editor?.chain().focus().redo().run()}
                icon={Redo2}
                label="Redo"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
              <div className="min-w-0 flex-1">
                <EditorContent editor={editor} />
              </div>

              <aside className="w-full">
                <div className="rounded-2xl border border-[#222426] bg-[#121315] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7d82]">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#e8e9ea]">
                        {collaborationLoading
                          ? "Loading collaboration state"
                          : collaboration
                            ? `Collaboration version ${collaboration.versionNumber}`
                            : "Content loaded from backend"}
                      </p>
                    </div>

                    <div className="h-8 w-px bg-[#222426]" />

                    <div className="text-sm text-[#c3c3c3]">
                      <span className="font-medium text-[#e8e9ea]">
                        {activeStats.words}
                      </span>{" "}
                      words
                      <span className="mx-2 text-[#7a7d82]">•</span>
                      <span className="font-medium text-[#e8e9ea]">
                        {activeStats.characters}
                      </span>{" "}
                      characters
                    </div>

                    <div className="flex-1" />

                    <div className="text-xs leading-5 text-[#7a7d82]">
                      Use the toolbar above to format, save to backend, and
                      download as Word-compatible `.rtf`.
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}

type ToolbarButtonProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      title={label}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition-colors ${
        active
          ? "border-[#6c5ce7] bg-[rgba(108,92,231,0.12)] text-[#f5f6f7]"
          : "border-[#222426] bg-[#1a1b1d] text-[#c3c3c3] hover:bg-[#252729] hover:text-[#f5f6f7]"
      }`}
    >
      <Icon size={15} />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}
