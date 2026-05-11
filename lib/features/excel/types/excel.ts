export type ExcelCellValue = string | number | boolean | null;

export type ExcelCellMeta = {
  row: number;
  col: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
};

export type ExcelWorkbookContent = {
  data: ExcelCellValue[][];
  cellMeta?: ExcelCellMeta[];
};

export type ExcelApiCell = {
  reference: string;
  value: ExcelCellValue;
  formula: string | null;
  type: string;
  styleId: number | null;
  bold: boolean;
  italic: boolean;
  fontId: number | null;
  numFmtId: number | null;
  underline?: boolean;
};

export type ExcelApiRow = Array<ExcelApiCell | null>;

export type ExcelFilePayload = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  userId: string;
  folderId: string;
  categoryId: string | null;
  name: string;
  createdBy: string;
  updatedBy: string | null;
  extension: string;
  size: number;
  path: string;
  isFavourite: boolean;
  isDeleted: boolean;
};

export type ExcelApiPayload = {
  file: ExcelFilePayload;
  sheetName: string;
  content: ExcelApiRow[];
};

export function apiCellToEditorValue(cell: ExcelApiCell): ExcelCellValue {
  return cell.formula ?? cell.value;
}

export function apiWorkbookToEditorContent(
  workbook?: ExcelApiPayload,
): ExcelWorkbookContent | undefined {
  if (!workbook?.content) return undefined;

  const maxColumns = workbook.content.reduce(
    (max, row) => Math.max(max, row.length),
    0,
  );

  const data = workbook.content.map((row) => {
    const nextRow = row.map((cell) => (cell ? apiCellToEditorValue(cell) : null));

    while (nextRow.length < maxColumns) {
      nextRow.push(null);
    }

    return nextRow;
  });

  const cellMeta = workbook.content.flatMap((row, rowIndex) =>
    row.flatMap((cell, colIndex) => {
      if (!cell) return [];

      const meta: ExcelCellMeta = { row: rowIndex, col: colIndex };

      if (cell.bold) meta.bold = true;
      if (cell.italic) meta.italic = true;
      if (cell.underline) meta.underline = true;

      return [meta];
    }),
  );

  return {
    data,
    cellMeta: cellMeta.length > 0 ? cellMeta : undefined,
  };
}
