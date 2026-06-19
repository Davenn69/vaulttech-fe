export type ExcelCellValue = string | number | boolean | null;

export type HorizontalAlignment = "left" | "center" | "right" | "justify";
export type VerticalAlignment = "top" | "middle" | "bottom";

export type ExcelCellMeta = {
  row: number;
  col: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  horizontalAlignment?: HorizontalAlignment;
  verticalAlignment?: VerticalAlignment;
  wrapText?: boolean;
  textRotation?: number;
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
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  horizontalAlignment?: HorizontalAlignment;
  verticalAlignment?: VerticalAlignment;
  wrapText?: boolean;
  textRotation?: number;
  textAlign?: HorizontalAlignment;
  verticalAlign?: VerticalAlignment;
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
  content: ExcelApiRow[] | ExcelWorkbookContent;
};

export type ExcelApiResponse = {
  data: ExcelApiPayload;
};

export function apiCellToEditorValue(cell: ExcelApiCell): ExcelCellValue {
  return cell.formula ?? cell.value;
}

function columnLabelToIndex(label: string) {
  let result = 0;

  for (const char of label.toUpperCase()) {
    const code = char.charCodeAt(0);

    if (code < 65 || code > 90) continue;

    result = result * 26 + (code - 64);
  }

  return result > 0 ? result - 1 : 0;
}

function referenceToPosition(reference: string) {
  const match = reference.match(/^([A-Z]+)(\d+)$/i);

  if (!match) {
    return { row: 0, col: 0 };
  }

  const [, columnLabel, rowLabel] = match;

  return {
    row: Math.max(Number(rowLabel) - 1, 0),
    col: columnLabelToIndex(columnLabel),
  };
}

function normalizeApiRows(workbook: ExcelApiPayload) {
  if (!Array.isArray(workbook.content)) return;
  const cells = workbook.content.flatMap((row) => row.filter(Boolean));

  const dimensions = cells.reduce(
    (acc, cell) => {
      const { row, col } = referenceToPosition(cell!.reference);
      return {
        rows: Math.max(acc.rows, row + 1),
        cols: Math.max(acc.cols, col + 1),
      };
    },
    { rows: 0, cols: 0 },
  );

  const data: ExcelCellValue[][] = Array.from({ length: dimensions.rows }, () =>
    Array.from({ length: dimensions.cols }, () => null),
  );

  const cellMeta: ExcelCellMeta[] = [];

  workbook.content.forEach((row) => {
    row.forEach((cell) => {
      if (!cell) return;

      const { row: rowIndex, col: colIndex } = referenceToPosition(
        cell.reference,
      );

      data[rowIndex][colIndex] = apiCellToEditorValue(cell);

      const meta: ExcelCellMeta = { row: rowIndex, col: colIndex };
      if (cell.bold) meta.bold = true;
      if (cell.italic) meta.italic = true;
      if (cell.underline) meta.underline = true;
      if (cell.textColor) meta.textColor = cell.textColor;
      if (cell.backgroundColor) meta.backgroundColor = cell.backgroundColor;
      if (cell.fontSize) meta.fontSize = cell.fontSize;
      if (cell.fontFamily) meta.fontFamily = cell.fontFamily;
      if (cell.horizontalAlignment ?? cell.textAlign) {
        meta.horizontalAlignment = cell.horizontalAlignment ?? cell.textAlign;
      }
      if (cell.verticalAlignment ?? cell.verticalAlign) {
        meta.verticalAlignment = cell.verticalAlignment ?? cell.verticalAlign;
      }
      if (cell.wrapText !== undefined) meta.wrapText = cell.wrapText;
      if (cell.textRotation !== undefined) meta.textRotation = cell.textRotation;
      cellMeta.push(meta);
    });
  });

  return {
    data,
    cellMeta: cellMeta.length > 0 ? cellMeta : undefined,
  };
}

function normalizeWorkbookData(workbook: ExcelWorkbookContent) {
  const maxColumns = workbook.data.reduce(
    (max, row) => Math.max(max, row.length),
    0,
  );

  const data = workbook.data.map((row) => {
    const nextRow = [...row];

    while (nextRow.length < maxColumns) {
      nextRow.push(null);
    }

    return nextRow;
  });

  return {
    data,
    cellMeta: workbook.cellMeta?.map((meta) => {
      const nextMeta: ExcelCellMeta = { ...meta };
      const legacyMeta = meta as ExcelCellMeta & {
        textAlign?: HorizontalAlignment;
        verticalAlign?: VerticalAlignment;
      };

      if (
        nextMeta.horizontalAlignment === undefined &&
        legacyMeta.textAlign !== undefined
      ) {
        nextMeta.horizontalAlignment = legacyMeta.textAlign;
      }

      if (
        nextMeta.verticalAlignment === undefined &&
        legacyMeta.verticalAlign !== undefined
      ) {
        nextMeta.verticalAlignment = legacyMeta.verticalAlign;
      }

      return nextMeta;
    }),
  };
}

export function apiWorkbookToEditorContent(
  workbook?: ExcelApiPayload,
): ExcelWorkbookContent | undefined {
  if (!workbook?.content) return undefined;

  if (!Array.isArray(workbook.content)) {
    return normalizeWorkbookData(workbook.content);
  }

  return normalizeApiRows(workbook);
}
