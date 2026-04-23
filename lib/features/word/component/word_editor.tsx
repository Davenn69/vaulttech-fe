"use client";

import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Code,
  Download,
  FilePlus2,
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
  Sparkles,
  Strikethrough,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { type ComponentType, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import useWord from "../hooks/useWord";

type WordDraft = {
  id: string;
  title: string;
  content: JSONContent;
  updatedAt: string;
};

const STORAGE_KEY = "vaulttech-word-drafts";

const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

function createDraftId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDraft(title = "Untitled document"): WordDraft {
  return {
    id: createDraftId(),
    title,
    content: EMPTY_DOCUMENT,
    updatedAt: new Date().toISOString(),
  };
}

function escapeRtfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\r?\n/g, "\\par ");
}

function encodeRtfUnicode(value: string) {
  let result = "";

  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0;

    if (codePoint <= 127) {
      result += char;
      continue;
    }

    const signed = codePoint > 32767 ? codePoint - 65536 : codePoint;
    result += `\\u${signed}?`;
  }

  return result;
}

function applyRtfMarks(text: string, marks?: JSONContent["marks"]) {
  if (!marks?.length) return text;

  let output = text;
  const markSet = new Set(marks.map((mark) => mark.type));

  if (markSet.has("code")) {
    output = `{\\f1 ${output}}`;
  }

  if (markSet.has("underline")) {
    output = `\\ul ${output} \\ulnone`;
  }

  if (markSet.has("strike")) {
    output = `\\strike ${output} \\strike0`;
  }

  if (markSet.has("italic")) {
    output = `\\i ${output} \\i0`;
  }

  if (markSet.has("bold")) {
    output = `\\b ${output} \\b0`;
  }

  return output;
}

function renderInlineContent(nodes?: JSONContent[]): string {
  if (!nodes?.length) return "";

  return nodes
    .map((node) => {
      if (node.type === "text") {
        const plainText = encodeRtfUnicode(escapeRtfText(node.text ?? ""));
        return applyRtfMarks(plainText, node.marks);
      }

      if (node.type === "hardBreak") {
        return "\\line ";
      }

      if (node.type === "textStyle" || node.type === "paragraph") {
        return renderInlineContent(node.content);
      }

      return renderBlockNode(node);
    })
    .join("");
}

function renderListItem(node: JSONContent, ordered = false, index = 1): string {
  const content = node.content ?? [];
  const paragraphs = content.filter((child) => child.type === "paragraph");
  const nestedBlocks = content.filter((child) => child.type !== "paragraph");
  const firstParagraph = paragraphs[0];
  const listPrefix = ordered ? `${index}.\\tab ` : "\\bullet\\tab ";

  let result = `${listPrefix}${renderInlineContent(firstParagraph?.content)}\\par `;

  paragraphs.slice(1).forEach((paragraph) => {
    result += `\\li360 ${renderInlineContent(paragraph.content)}\\par `;
  });

  nestedBlocks.forEach((child) => {
    result += renderBlockNode(child);
  });

  return result;
}

function renderBlockNode(node: JSONContent): string {
  switch (node.type) {
    case "paragraph":
      return `${renderInlineContent(node.content)}\\par `;

    case "heading": {
      const level = Number(node.attrs?.level ?? 1);
      const sizeByLevel: Record<number, number> = {
        1: 36,
        2: 30,
        3: 26,
        4: 24,
        5: 22,
        6: 20,
      };
      const size = sizeByLevel[level] ?? 28;
      return `\\b\\fs${size} ${renderInlineContent(node.content)}\\b0\\fs24\\par `;
    }

    case "blockquote":
      return `\\li720\\ri720\\i ${renderInlineContent(node.content)}\\i0\\par `;

    case "bulletList":
      return (node.content ?? [])
        .map((child) => renderListItem(child, false))
        .join("");

    case "orderedList":
      return (node.content ?? [])
        .map((child, index) => renderListItem(child, true, index + 1))
        .join("");

    case "listItem":
      return renderListItem(node);

    case "codeBlock":
      return `\\f1 ${escapeRtfText(node.content?.[0]?.text ?? "")}\\f0\\par `;

    case "horizontalRule":
      return "\\par\\pard\\brdrb\\brdrs\\brdrw10\\brsp20\\par ";

    case "text":
      return applyRtfMarks(
        encodeRtfUnicode(escapeRtfText(node.text ?? "")),
        node.marks,
      );

    case "hardBreak":
      return "\\line ";

    default:
      return renderInlineContent(node.content);
  }
}

function toRtfDocument(title: string, content: JSONContent) {
  const body = renderBlockNode(content);

  return [
    "{\\rtf1\\ansi\\deff0",
    "{\\fonttbl{\\f0\\fnil Arial;}{\\f1\\fmodern Consolas;}}",
    "{\\colortbl;\\red0\\green0\\blue0;\\red25\\green118\\blue210;}",
    "\\viewkind4\\uc1\\pard\\f0\\fs24",
    `\\b ${encodeRtfUnicode(escapeRtfText(title))}\\b0\\par\\par `,
    body,
    "}",
  ].join("");
}

function normalizeEditorContent(raw?: JSONContent | string): JSONContent {
  if (!raw) return EMPTY_DOCUMENT;

  if (typeof raw !== "string") {
    if (raw.type === "doc") return raw;
    return {
      type: "doc",
      content: Array.isArray(raw.content)
        ? raw.content
        : EMPTY_DOCUMENT.content,
    };
  }

  const trimmed = raw.trim();
  if (!trimmed) return EMPTY_DOCUMENT;

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      (parsed as JSONContent).type === "doc"
    ) {
      return parsed as JSONContent;
    }
  } catch {
    // Fall back to plain text if the API returns a non-JSON string.
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: raw,
          },
        ],
      },
    ],
  };
}

function loadDrafts(): WordDraft[] {
  if (typeof window === "undefined") return [createDraft()];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [createDraft()];

  try {
    const parsed = JSON.parse(raw) as WordDraft[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createDraft()];
    }

    return parsed;
  } catch {
    return [createDraft()];
  }
}

function saveDrafts(drafts: WordDraft[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export default function WordEditor({ id }: { id: string }) {
  const { loading, content } = useWord(id);
  const [drafts, setDrafts] = useState<WordDraft[]>(() => loadDrafts());
  const [activeDraftId, setActiveDraftId] = useState(
    () => loadDrafts()[0]?.id ?? "",
  );
  const lastAppliedRemoteContentRef = useRef<string | undefined>("");

  const activeDraft =
    drafts.find((draft) => draft.id === activeDraftId) ?? drafts[0];

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
      content: activeDraft?.content ?? EMPTY_DOCUMENT,
      editorProps: {
        attributes: {
          class:
            "min-h-[540px] w-full rounded-3xl border border-[#2a2c2e] bg-[#121315] px-6 py-5 text-[15px] leading-7 text-[#e8e9ea] outline-none focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.15)]",
        },
      },
      onUpdate: ({ editor: instance }) => {
        const nextContent = instance.getJSON();

        setDrafts((current) =>
          current.map((draft) =>
            draft.id === activeDraftId
              ? {
                  ...draft,
                  content: nextContent,
                }
              : draft,
          ),
        );
      },
    },
    [activeDraftId],
  );

  useEffect(() => {
    if (!editor || !activeDraft) return;
    editor.commands.setContent(activeDraft.content);
  }, [activeDraft, editor]);

  useEffect(() => {
    if (!editor || !content || !activeDraft) return;
    const nextContent = normalizeEditorContent(content);
    const contentSignature = JSON.stringify(nextContent);

    if (lastAppliedRemoteContentRef.current === contentSignature) return;
    lastAppliedRemoteContentRef.current = contentSignature;

    editor.commands.setContent(nextContent);
  }, [activeDraft, content, editor]);

  useEffect(() => {
    if (drafts.length === 0) return;
    saveDrafts(drafts);
  }, [drafts]);

  const plainText = editor?.getText() ?? "";
  const activeStats = {
    words: plainText.trim() ? plainText.trim().split(/\s+/).length : 0,
    characters: plainText.length,
  };

  const syncCurrentDraft = () => {
    if (!editor || !activeDraft) return;

    const updatedAt = new Date().toISOString();
    const nextContent = editor.getJSON();
    const nextTitle = activeDraft.title.trim() || "Untitled document";

    setDrafts((current) =>
      current.map((draft) =>
        draft.id === activeDraft.id
          ? {
              ...draft,
              title: nextTitle,
              content: nextContent,
              updatedAt,
            }
          : draft,
      ),
    );
    toast.success("Draft saved");
  };

  const createNewDraft = () => {
    const nextDraft = createDraft();
    setDrafts((current) => [nextDraft, ...current]);
    setActiveDraftId(nextDraft.id);
    editor?.commands.setContent(EMPTY_DOCUMENT);
    toast.success("New draft created");
  };

  const deleteDraft = (draftId: string) => {
    if (drafts.length <= 1) {
      toast.error("Keep at least one draft");
      return;
    }

    const nextDrafts = drafts.filter((draft) => draft.id !== draftId);
    setDrafts(nextDrafts);

    if (draftId === activeDraftId) {
      const fallback = nextDrafts[0];
      setActiveDraftId(fallback.id);
      editor?.commands.setContent(fallback.content);
    }

    toast.success("Draft deleted");
  };

  const downloadAsWord = () => {
    if (!editor || !activeDraft) return;

    const nextTitle = activeDraft.title.trim() || activeDraft.title;
    const rtf = toRtfDocument(nextTitle, editor.getJSON());
    const blob = new Blob([rtf], { type: "application/rtf" });
    const fileName = `${nextTitle.replace(/[\\/:*?"<>|]/g, "-")}.rtf`;
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
        {/* <aside className="hidden w-[300px] shrink-0 border-r border-[#222426] bg-[#121315] px-4 py-5 xl:block">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
                Word workspace
              </p>
              <h1 className="mt-2 text-lg font-semibold text-[#f5f6f7]">
                Draft library
              </h1>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(108,92,231,0.12)] text-[#6c5ce7]">
              <Sparkles size={18} />
            </div>
          </div>

          <button
            type="button"
            onClick={createNewDraft}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6c5ce7] px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <FilePlus2 size={16} />
            New document
          </button>

          <div className="space-y-2">
            {drafts.map((draft) => {
              const isActive = draft.id === activeDraftId;

              return (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => {
                    setActiveDraftId(draft.id);
                    editor?.commands.setContent(draft.content);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "border-[#6c5ce7] bg-[rgba(108,92,231,0.12)]"
                      : "border-[#222426] bg-[#17181a] hover:border-[#2a2c2e]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#f5f6f7]">
                        {draft.title}
                      </p>
                      <p className="mt-1 text-xs text-[#7a7d82]">
                        Updated {new Date(draft.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteDraft(draft.id);
                      }}
                      className="rounded-lg p-1.5 text-[#7a7d82] transition-colors hover:bg-[#252729] hover:text-[#ff6b6b]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        </aside> */}

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222426] bg-[#121315] px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
                Document
              </p>
              <input
                value={activeDraft?.title ?? ""}
                onChange={(event) => {
                  const nextTitle = event.target.value;

                  setDrafts((current) =>
                    current.map((draft) =>
                      draft.id === activeDraftId
                        ? {
                            ...draft,
                            title: nextTitle,
                          }
                        : draft,
                    ),
                  );
                }}
                className="mt-2 w-full max-w-[680px] bg-transparent text-2xl font-semibold text-[#f5f6f7] outline-none placeholder:text-[#4a4d52]"
                placeholder="Untitled document"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={syncCurrentDraft}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a2c2e] bg-[#1a1b1d] px-4 py-2 text-sm font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729]"
              >
                <Save size={15} />
                Save
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
                active={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                icon={Bold}
                label="Bold"
              />
              <ToolbarButton
                active={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                icon={Italic}
                label="Italic"
              />
              <ToolbarButton
                active={editor?.isActive("underline")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                icon={UnderlineIcon}
                label="Underline"
              />
              <ToolbarButton
                active={editor?.isActive("strike")}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                icon={Strikethrough}
                label="Strikethrough"
              />

              <div className="mx-1 h-8 w-px bg-[#222426]" />

              <ToolbarButton
                active={editor?.isActive("heading", { level: 1 })}
                onClick={() => setHeading(1)}
                icon={Heading1}
                label="Heading 1"
              />
              <ToolbarButton
                active={editor?.isActive("heading", { level: 2 })}
                onClick={() => setHeading(2)}
                icon={Heading2}
                label="Heading 2"
              />
              <ToolbarButton
                active={editor?.isActive("heading", { level: 3 })}
                onClick={() => setHeading(3)}
                icon={Heading3}
                label="Heading 3"
              />
              <ToolbarButton
                active={editor?.isActive("bulletList")}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                icon={List}
                label="Bullets"
              />
              <ToolbarButton
                active={editor?.isActive("orderedList")}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                icon={ListOrdered}
                label="Numbered"
              />
              <ToolbarButton
                active={editor?.isActive("blockquote")}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                icon={Quote}
                label="Quote"
              />
              <ToolbarButton
                active={editor?.isActive("codeBlock")}
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                icon={Code}
                label="Code block"
              />
              <ToolbarButton
                active={editor?.isActive("link")}
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
                      {/* <p className="mt-1 text-sm font-medium text-[#e8e9ea]">
                        {activeDraft?.updatedAt
                          ? `Saved ${new Date(activeDraft.updatedAt).toLocaleString()}`
                          : "Not saved yet"}
                      </p> */}
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
                      Use the toolbar above to format, save to keep local, and
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
