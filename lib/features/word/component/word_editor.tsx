"use client";

import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
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
import { type ComponentType, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import useWord from "../hooks/useWord";

const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

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

export default function WordEditor({ id }: { id: string }) {
  const { loading, saving, content, saveContent } = useWord(id);
  const [, setEditorTick] = useState(0);
  const lastAppliedRemoteContentRef = useRef<string | undefined>("");

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
      onUpdate: () => {
        setEditorTick((current) => current + 1);
      },
      onSelectionUpdate: () => {
        setEditorTick((current) => current + 1);
      },
    },
    [content],
  );

  useEffect(() => {
    if (!editor || !content) return;

    const nextContent = normalizeEditorContent(content);
    const contentSignature = JSON.stringify(nextContent);
    const editorSignature = JSON.stringify(editor.getJSON());

    if (contentSignature === editorSignature) return;
    if (lastAppliedRemoteContentRef.current === contentSignature) return;

    lastAppliedRemoteContentRef.current = contentSignature;
    editor.commands.setContent(nextContent, false);
  }, [content, editor]);

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

    console.log(nextContent);

    try {
      await saveContent(id, nextContent);
      toast.success("Document saved");
    } catch {
      return;
    }
  };

  const downloadAsWord = () => {
    if (!editor) return;

    const nextTitle = "Document";
    const rtf = toRtfDocument(nextTitle, editor.getJSON());
    const blob = new Blob([rtf], { type: "application/rtf" });
    const fileName = "document.rtf";
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
            <div className="min-w-0">
              <h1 className="mt-2 text-2xl font-semibold text-[#f5f6f7]">
                Word editor
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                        Content loaded from backend
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
