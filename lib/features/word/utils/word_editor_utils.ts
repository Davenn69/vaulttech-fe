import type { JSONContent } from "@tiptap/react";

export const EMPTY_DOCUMENT: JSONContent = {
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

export function toRtfDocument(title: string, content: JSONContent) {
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

export function normalizeEditorContent(raw?: JSONContent | string): JSONContent {
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

export function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "G";

  return parts
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getConnectionLabel(status: string) {
  switch (status) {
    case "connected":
      return "Live";
    case "connecting":
      return "Connecting";
    case "disconnected":
      return "Reconnecting";
    case "error":
      return "Offline";
    default:
      return "Idle";
  }
}
