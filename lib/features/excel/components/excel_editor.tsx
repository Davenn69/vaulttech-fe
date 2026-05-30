"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HotTable, { HotTableRef } from "@handsontable/react-wrapper";
import Handsontable from "handsontable";
import { textRenderer as TextRenderer } from "handsontable/renderers/textRenderer";
import { HyperFormula } from "hyperformula";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/utils/api";
import axios from "axios";
import toast from "react-hot-toast";
import { useExcel } from "../hooks/useExcel";
import { DownloadFileUrl } from "../../home/types/file";
import {
  Bold,
  Italic,
  Underline,
  Undo2,
  Redo2,
  Trash2,
  Sigma,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Rows3,
  Merge,
  Plus,
  Minus,
  PaintBucket,
  Type,
  Eraser,
  Eye,
  Download,
  Save,
  ArrowLeft,
} from "lucide-react";
import { ExcelCellValue, ExcelWorkbookContent } from "../types/excel";
import { useRouter } from "next/navigation";

type ExcelEditorProps = {
  workbookId: string;
};

type AlignMode = "left" | "center" | "right" | "justify";
type VerticalMode = "top" | "middle" | "bottom";
type SelectionBounds = {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  highlightRow: number;
  highlightCol: number;
};

const DEFAULT_ROWS = 40;
const DEFAULT_COLS = 16;
const DEFAULT_FONT_SIZE = 14;

function buildColumns(total: number) {
  const labels: string[] = [];
  for (let index = 0; index < total; index += 1) {
    let n = index + 1;
    let label = "";
    while (n > 0) {
      const remainder = (n - 1) % 26;
      label = String.fromCharCode(65 + remainder) + label;
      n = Math.floor((n - 1) / 26);
    }
    labels.push(label);
  }
  return labels;
}

function createInitialData(rows: number, cols: number) {
  const data: Array<Array<string | number>> = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ""),
  );

  return data;
}

function getWorkbookDimensions(data: Array<Array<ExcelCellValue>>) {
  return data.reduce(
    (dimensions, row) => ({
      rows: dimensions.rows + 1,
      cols: Math.max(dimensions.cols, row.length),
    }),
    { rows: 0, cols: 0 },
  );
}

function normalizeTableData(
  data: Array<Array<ExcelCellValue>> | undefined,
  fallbackRows = DEFAULT_ROWS,
  fallbackCols = DEFAULT_COLS,
) {
  if (!data || data.length === 0) {
    return createInitialData(fallbackRows, fallbackCols);
  }

  const { rows, cols } = getWorkbookDimensions(data);
  const nextRows = Math.max(rows, fallbackRows);
  const nextCols = Math.max(cols, fallbackCols);

  return Array.from({ length: nextRows }, (_, rowIndex) => {
    const row = data[rowIndex] ?? [];
    return Array.from(
      { length: nextCols },
      (_, colIndex) => row[colIndex] ?? "",
    );
  });
}

function toColumnLabel(column: number) {
  let n = column + 1;
  let label = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

function formatAddress(row: number, col: number) {
  return `${toColumnLabel(col)}${row + 1}`;
}

function getSelectedCells(bounds: SelectionBounds | null) {
  if (!bounds) return [];

  const cells: Array<{ row: number; col: number }> = [];

  for (let row = bounds.fromRow; row <= bounds.toRow; row += 1) {
    for (let col = bounds.fromCol; col <= bounds.toCol; col += 1) {
      cells.push({ row, col });
    }
  }

  return cells;
}

function spreadsheetRenderer(...args: Parameters<typeof TextRenderer>) {
  const [instance, td, row, col, prop, value, cellProperties] = args;

  TextRenderer(instance, td, row, col, prop, value, cellProperties);

  const meta = cellProperties as Handsontable.CellProperties & {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    textAlign?: AlignMode;
    verticalAlign?: VerticalMode;
    fontFamily?: string;
  };

  td.style.fontWeight = meta.bold ? "700" : "400";
  td.style.fontStyle = meta.italic ? "italic" : "normal";
  td.style.textDecoration = meta.underline ? "underline" : "none";
  td.style.color = meta.textColor ?? "";
  td.style.backgroundColor = meta.backgroundColor ?? "";
  td.style.fontSize = `${meta.fontSize ?? DEFAULT_FONT_SIZE}px`;
  td.style.textAlign = meta.textAlign ?? "left";
  td.style.verticalAlign = meta.verticalAlign ?? "middle";
  td.style.fontFamily = meta.fontFamily ?? 'Inter, "Segoe UI", sans-serif';
  td.style.whiteSpace = "pre-wrap";
}

const FORMATTING_KEYS = [
  "bold",
  "italic",
  "underline",
  "textAlign",
  "verticalAlign",
  "textColor",
  "backgroundColor",
  "fontSize",
  "fontFamily",
] as const;

type ExcelCellMetaEntry = NonNullable<ExcelWorkbookContent["cellMeta"]>[number];

function isCustomMetaDefined(meta: ExcelCellMetaEntry) {
  return FORMATTING_KEYS.some((key) => meta[key] !== undefined);
}

export default function ExcelEditor({ workbookId }: ExcelEditorProps) {
  const router = useRouter();
  const hotRef = useRef<HotTableRef | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef<SelectionBounds | null>({
    fromRow: 0,
    fromCol: 0,
    toRow: 0,
    toCol: 0,
    highlightRow: 0,
    highlightCol: 0,
  });
  const [selectedAddress, setSelectedAddress] = useState("A1");
  const [formulaInput, setFormulaInput] = useState("Revenue");
  const [selectedValue, setSelectedValue] = useState<string>("Revenue");
  const [selectedMeta, setSelectedMeta] = useState<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textAlign?: AlignMode;
    verticalAlign?: VerticalMode;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
  }>({});
  const { loading, saving, content, saveContent, fileName, renameFile } =
    useExcel(workbookId);
  const [documentName, setDocumentName] = useState("Spreadsheet");
  const [isEditingName, setIsEditingName] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const previousNameRef = useRef("Spreadsheet");
  const activeDocumentName = fileName ?? documentName;

  const [tableData, setTableData] = useState<Array<Array<ExcelCellValue>>>(() =>
    createInitialData(DEFAULT_ROWS, DEFAULT_COLS),
  );
  const [sheetDimensions, setSheetDimensions] = useState({
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
  });
  const columnLabels = useMemo(
    () => buildColumns(sheetDimensions.cols),
    [sheetDimensions.cols],
  );
  const hotStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const formulas = useMemo(() => ({ engine: HyperFormula }), []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!fileName) return;

    setDocumentName(fileName);
    previousNameRef.current = fileName;
    document.title = `${fileName} - Excel editor`;
  }, [fileName]);

  useEffect(() => {
    if (!isEditingName) return;

    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [isEditingName]);

  const updateSelectedState = useCallback((hot: Handsontable.Core | null) => {
    if (!hot) return;

    const range = hot.getSelectedRangeLast();
    if (!range) return;

    const current = range.highlight;
    const row = current.row;
    const col = current.col;
    if (row < 0 || col < 0) return;

    const rawValue = hot.getSourceDataAtCell(row, col);
    const renderedValue = hot.getDataAtCell(row, col);
    const meta = hot.getCellMeta(row, col) as typeof selectedMeta;
    const nextAddress = formatAddress(row, col);
    const nextFormulaInput = rawValue == null ? "" : String(rawValue);
    const nextSelectedValue =
      renderedValue == null ? "" : String(renderedValue);
    const nextSelectedMeta = {
      bold: meta.bold,
      italic: meta.italic,
      underline: meta.underline,
      textAlign: meta.textAlign,
      verticalAlign: meta.verticalAlign,
      textColor: meta.textColor,
      backgroundColor: meta.backgroundColor,
      fontSize: meta.fontSize,
    };

    selectionRef.current = {
      fromRow: range.getTopStartCorner().row,
      fromCol: range.getTopStartCorner().col,
      toRow: range.getBottomEndCorner().row,
      toCol: range.getBottomEndCorner().col,
      highlightRow: row,
      highlightCol: col,
    };

    setSelectedAddress((currentValue) =>
      currentValue === nextAddress ? currentValue : nextAddress,
    );
    setFormulaInput((currentValue) =>
      currentValue === nextFormulaInput ? currentValue : nextFormulaInput,
    );
    setSelectedValue((currentValue) =>
      currentValue === nextSelectedValue ? currentValue : nextSelectedValue,
    );
    setSelectedMeta((currentValue) => {
      const isSame =
        currentValue.bold === nextSelectedMeta.bold &&
        currentValue.italic === nextSelectedMeta.italic &&
        currentValue.underline === nextSelectedMeta.underline &&
        currentValue.textAlign === nextSelectedMeta.textAlign &&
        currentValue.verticalAlign === nextSelectedMeta.verticalAlign &&
        currentValue.textColor === nextSelectedMeta.textColor &&
        currentValue.backgroundColor === nextSelectedMeta.backgroundColor &&
        currentValue.fontSize === nextSelectedMeta.fontSize;

      return isSame ? currentValue : nextSelectedMeta;
    });
  }, []);

  const syncSelection = useCallback(
    (hot: Handsontable.Core | null) => {
      updateSelectedState(hot);
    },
    [updateSelectedState],
  );

  const applyWorkbookContent = useCallback(
    (hot: Handsontable.Core, workbook?: ExcelWorkbookContent) => {
      if (!workbook) return;

      const nextData = normalizeTableData(workbook.data);
      const nextDimensions = getWorkbookDimensions(nextData);

      setTableData(nextData);
      setSheetDimensions((current) => ({
        rows: Math.max(current.rows, nextDimensions.rows),
        cols: Math.max(current.cols, nextDimensions.cols),
      }));

      hot.batch(() => {
        FORMATTING_KEYS.forEach((key) => {
          for (let row = 0; row < hot.countRows(); row += 1) {
            for (let col = 0; col < hot.countCols(); col += 1) {
              hot.removeCellMeta(row, col, key);
            }
          }
        });

        workbook.cellMeta?.forEach((meta: any) => {
          if (!isCustomMetaDefined(meta)) return;

          const {
            row,
            col,
            bold,
            italic,
            underline,
            textAlign,
            verticalAlign,
            textColor,
            backgroundColor,
            fontSize,
            fontFamily,
          } = meta;

          if (bold !== undefined) hot.setCellMeta(row, col, "bold", bold);
          if (italic !== undefined) hot.setCellMeta(row, col, "italic", italic);
          if (underline !== undefined)
            hot.setCellMeta(row, col, "underline", underline);
          if (textAlign !== undefined)
            hot.setCellMeta(row, col, "textAlign", textAlign);
          if (verticalAlign !== undefined)
            hot.setCellMeta(row, col, "verticalAlign", verticalAlign);
          if (textColor !== undefined)
            hot.setCellMeta(row, col, "textColor", textColor);
          if (backgroundColor !== undefined)
            hot.setCellMeta(row, col, "backgroundColor", backgroundColor);
          if (fontSize !== undefined)
            hot.setCellMeta(row, col, "fontSize", fontSize);
          if (fontFamily !== undefined)
            hot.setCellMeta(row, col, "fontFamily", fontFamily);
        });
      });

      hot.render();
      updateSelectedState(hot);
    },
    [updateSelectedState],
  );

  useEffect(() => {
    if (!content) return;

    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    applyWorkbookContent(hot, content);
  }, [applyWorkbookContent, content]);

  const handleAfterInit = useCallback(() => {
    syncSelection(hotRef.current?.hotInstance ?? null);
  }, [syncSelection]);

  const handleAfterSelectionEnd = useCallback(() => {
    syncSelection(hotRef.current?.hotInstance ?? null);
  }, [syncSelection]);

  const handleAfterChange = useCallback(
    (_changes: unknown, source: string) => {
      if (
        source === "loadData" ||
        source === "UndoRedo.undo" ||
        source === "UndoRedo.redo"
      ) {
        updateSelectedState(hotRef.current?.hotInstance ?? null);
        return;
      }
      updateSelectedState(hotRef.current?.hotInstance ?? null);
    },
    [updateSelectedState],
  );

  const handleAfterCreateOrRemove = useCallback(() => {
    const hot = hotRef.current?.hotInstance ?? null;
    if (hot) {
      setSheetDimensions({
        rows: hot.countRows(),
        cols: hot.countCols(),
      });
    }
    updateSelectedState(hot);
  }, [updateSelectedState]);

  const renderCellProps = useCallback((row: number, col: number) => {
    const cellProperties = {} as Handsontable.CellProperties & {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      textAlign?: AlignMode;
      verticalAlign?: VerticalMode;
      textColor?: string;
      backgroundColor?: string;
      fontSize?: number;
    };

    cellProperties.renderer = spreadsheetRenderer;

    if (row === 0 && col === 0) {
      cellProperties.bold = true;
      cellProperties.fontSize = 16;
    }

    return cellProperties;
  }, []);

  const captureSelection = (hot: Handsontable.Core | null) => {
    if (!hot) return null;

    const range = hot.getSelectedRangeLast();
    if (!range) return selectionRef.current;

    const start = range.getTopStartCorner();
    const end = range.getBottomEndCorner();
    const highlight = range.highlight;
    const bounds: SelectionBounds = {
      fromRow: start.row,
      fromCol: start.col,
      toRow: end.row,
      toCol: end.col,
      highlightRow: highlight.row,
      highlightCol: highlight.col,
    };

    selectionRef.current = bounds;
    return bounds;
  };

  const applyToSelection = (updater: (row: number, col: number) => void) => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const cells = getSelectedCells(captureSelection(hot));
    if (cells.length === 0) return;

    hot.batch(() => {
      cells.forEach(({ row, col }) => updater(row, col));
    });
    hot.render();
    updateSelectedState(hot);
  };

  const setBooleanStyle = (key: "bold" | "italic" | "underline") => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const cells = getSelectedCells(captureSelection(hot));
    if (cells.length === 0) return;

    const shouldEnable = !cells.every(({ row, col }) =>
      Boolean(hot.getCellMeta(row, col)[key]),
    );

    applyToSelection((row, col) => {
      hot.setCellMeta(row, col, key, shouldEnable);
    });
  };

  const setAlign = (align: AlignMode) => {
    applyToSelection((row, col) => {
      hotRef.current?.hotInstance?.setCellMeta(row, col, "textAlign", align);
    });
  };

  const setVerticalAlign = (align: VerticalMode) => {
    applyToSelection((row, col) => {
      hotRef.current?.hotInstance?.setCellMeta(
        row,
        col,
        "verticalAlign",
        align,
      );
    });
  };

  const setColor = (key: "textColor" | "backgroundColor", value: string) => {
    applyToSelection((row, col) => {
      hotRef.current?.hotInstance?.setCellMeta(row, col, key, value);
    });
  };

  const setFontSize = (value: number) => {
    applyToSelection((row, col) => {
      hotRef.current?.hotInstance?.setCellMeta(row, col, "fontSize", value);
    });
  };

  const clearFormatting = () => {
    applyToSelection((row, col) => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) return;

      [
        "bold",
        "italic",
        "underline",
        "textAlign",
        "verticalAlign",
        "textColor",
        "backgroundColor",
        "fontSize",
        "fontFamily",
      ].forEach((key) => hot.removeCellMeta(row, col, key));
    });
  };

  const mergeSelection = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const range = hot.getSelectedRangeLast();
    if (!range) return;

    const mergePlugin = hot.getPlugin(
      "mergeCells",
    ) as Handsontable.plugins.MergeCells;

    mergePlugin.mergeSelection(range);
  };

  const commitFormula = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const bounds = captureSelection(hot);
    if (!bounds) return;
    if (bounds.highlightRow < 0 || bounds.highlightCol < 0) return;

    hot.setDataAtCell(
      bounds.highlightRow,
      bounds.highlightCol,
      formulaInput,
      "excel-editor",
    );
    hot.render();
    updateSelectedState(hot);
  };

  const undo = () =>
    (
      hotRef.current?.hotInstance?.getPlugin(
        "undoRedo",
      ) as Handsontable.plugins.UndoRedo | null
    )?.undo();
  const redo = () =>
    (
      hotRef.current?.hotInstance?.getPlugin(
        "undoRedo",
      ) as Handsontable.plugins.UndoRedo | null
    )?.redo();

  const renameCurrentFile = async (nextName: string) => {
    if (!workbookId || renaming) return;

    const trimmedName = nextName.trim();

    if (!trimmedName) {
      toast.error("Nama file tidak boleh kosong");
      return;
    }

    setRenaming(true);

    try {
      await renameFile(workbookId, trimmedName);
      setDocumentName(trimmedName);
      previousNameRef.current = trimmedName;
      document.title = `${trimmedName} - Excel editor`;
    } finally {
      setRenaming(false);
    }
  };

  const submitRename = async () => {
    setIsEditingName(false);

    if (documentName === previousNameRef.current) return;

    await renameCurrentFile(documentName);
  };

  const syncCurrentDraft = async () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const cellMeta = hot
      .getCellsMeta()
      .map((meta) => ({
        row: meta.row,
        col: meta.col,
        bold: meta.bold,
        italic: meta.italic,
        underline: meta.underline,
        textAlign: meta.textAlign,
        verticalAlign: meta.verticalAlign,
        textColor: meta.textColor,
        backgroundColor: meta.backgroundColor,
        fontSize: meta.fontSize,
        fontFamily: meta.fontFamily,
      }))
      .filter(isCustomMetaDefined);

    try {
      await saveContent(workbookId, {
        data: hot.getSourceData() as Array<Array<ExcelCellValue>>,
        cellMeta,
      });
      toast.success("Workbook saved");
    } catch {
      return;
    }
  };

  const downloadAsExcel = async () => {
    try {
      const res = await api.get<ApiResponse<DownloadFileUrl>>(
        `/file/download/${workbookId}`,
      );

      const { downloadUrl } = res.data;

      if (!downloadUrl) {
        throw new Error("Missing download url");
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${activeDocumentName}.xlsx`;
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Excel file downloaded");
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to download file";

      toast.error(message ?? "Failed to download file");
    }
  };

  return (
    <div className="min-h-screen  text-[#eef1f4]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-4 p-4 md:p-6">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col items-start gap-3">
                <div className="flex flex-row gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2c2e] bg-[#1a1b1d] px-3 py-1.5 text-xs font-medium text-[#e8e9ea] transition-colors hover:bg-[#252729]"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#7a7d82]">
                    Excel editor
                  </p>
                </div>
                <div>
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
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={syncCurrentDraft} className="tool-btn">
                    <Save size={16} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={downloadAsExcel} className="tool-btn">
                    <Download size={16} />
                    Download
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/70">
                  <Eye size={16} />
                  {selectedAddress}
                  <span className="text-white/30">|</span>
                  <span className="max-w-[280px] truncate">
                    {selectedValue}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={undo} className="tool-btn">
                <Undo2 size={16} />
                Undo
              </button>
              <button onClick={redo} className="tool-btn">
                <Redo2 size={16} />
                Redo
              </button>
              <button
                onClick={() => setBooleanStyle("bold")}
                className={`tool-btn ${selectedMeta.bold ? "tool-btn-active" : ""}`}
              >
                <Bold size={16} />
                Bold
              </button>
              <button
                onClick={() => setBooleanStyle("italic")}
                className={`tool-btn ${selectedMeta.italic ? "tool-btn-active" : ""}`}
              >
                <Italic size={16} />
                Italic
              </button>
              <button
                onClick={() => setBooleanStyle("underline")}
                className={`tool-btn ${selectedMeta.underline ? "tool-btn-active" : ""}`}
              >
                <Underline size={16} />
                Underline
              </button>
              <button
                onClick={() => setAlign("left")}
                className={`tool-btn ${selectedMeta.textAlign === "left" ? "tool-btn-active" : ""}`}
              >
                <AlignLeft size={16} />
                Left
              </button>
              <button
                onClick={() => setAlign("center")}
                className={`tool-btn ${selectedMeta.textAlign === "center" ? "tool-btn-active" : ""}`}
              >
                <AlignCenter size={16} />
                Center
              </button>
              <button
                onClick={() => setAlign("right")}
                className={`tool-btn ${selectedMeta.textAlign === "right" ? "tool-btn-active" : ""}`}
              >
                <AlignRight size={16} />
                Right
              </button>
              <button
                onClick={() => setAlign("justify")}
                className={`tool-btn ${selectedMeta.textAlign === "justify" ? "tool-btn-active" : ""}`}
              >
                <AlignJustify size={16} />
                Justify
              </button>
              <button
                onClick={() => setVerticalAlign("top")}
                className={`tool-btn ${selectedMeta.verticalAlign === "top" ? "tool-btn-active" : ""}`}
              >
                <Rows3 size={16} />
                Top
              </button>
              <button
                onClick={() => setVerticalAlign("middle")}
                className={`tool-btn ${selectedMeta.verticalAlign === "middle" ? "tool-btn-active" : ""}`}
              >
                <Rows3 size={16} />
                Middle
              </button>
              <button
                onClick={() => setVerticalAlign("bottom")}
                className={`tool-btn ${selectedMeta.verticalAlign === "bottom" ? "tool-btn-active" : ""}`}
              >
                <Rows3 size={16} />
                Bottom
              </button>
              <button onClick={() => mergeSelection()} className="tool-btn">
                <Merge size={16} />
                Merge
              </button>
              <button onClick={clearFormatting} className="tool-btn">
                <Eraser size={16} />
                Clear style
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <Sigma size={16} className="text-[#8fb4ff]" />
                <input
                  value={formulaInput}
                  onChange={(e) => setFormulaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitFormula();
                  }}
                  placeholder="Type a value or a formula, for example =SUM(B1:C1)"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <Type size={16} className="text-[#8fb4ff]" />
                <select
                  value={String(selectedMeta.fontSize ?? DEFAULT_FONT_SIZE)}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full bg-transparent text-sm text-white outline-none"
                >
                  {[10, 11, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <PaintBucket size={16} className="text-[#8fb4ff]" />
                <input
                  type="color"
                  value={selectedMeta.backgroundColor ?? "#1c1c1c"}
                  onChange={(e) => setColor("backgroundColor", e.target.value)}
                  className="h-8 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <Type size={16} className="text-[#8fb4ff]" />
                <input
                  type="color"
                  value={selectedMeta.textColor ?? "#eeeeee"}
                  onChange={(e) => setColor("textColor", e.target.value)}
                  className="h-8 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
              </label>
            </div>
          </div>

          <div className="h-[calc(100vh-320px)] min-h-[560px] bg-[#111316]">
            <div suppressHydrationWarning className="h-full w-full">
              {isMounted ? (
                <HotTable
                  ref={hotRef}
                  className="ht-theme-main-dark"
                  style={hotStyle}
                  data={tableData}
                  colHeaders={columnLabels}
                  rowHeaders={true}
                  colWidths={120}
                  rowHeights={32}
                  width="100%"
                  height="100%"
                  stretchH="all"
                  manualColumnResize={true}
                  manualRowResize={true}
                  hiddenColumns={false}
                  hiddenRows={false}
                  mergeCells={true}
                  fillHandle={true}
                  multiColumnSorting={true}
                  dropdownMenu={true}
                  contextMenu={true}
                  filters={true}
                  licenseKey="non-commercial-and-evaluation"
                  formulas={formulas}
                  afterInit={handleAfterInit}
                  afterSelectionEnd={handleAfterSelectionEnd}
                  afterChange={handleAfterChange}
                  afterCreateRow={handleAfterCreateOrRemove}
                  afterCreateCol={handleAfterCreateOrRemove}
                  afterRemoveRow={handleAfterCreateOrRemove}
                  afterRemoveCol={handleAfterCreateOrRemove}
                  cells={renderCellProps}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
          <div className="flex items-center gap-2">
            <Download size={16} />
            <span>
              {loading
                ? "Loading workbook..."
                : "Ready to extend with save/export hooks."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-[#ff8d8d]" />
            <span>Selection actions apply to the active range.</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.18);
          padding: 0.55rem 0.9rem;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.82);
          transition:
            background-color 150ms ease,
            border-color 150ms ease,
            transform 150ms ease;
        }

        .tool-btn:hover {
          border-color: rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .tool-btn-active {
          border-color: rgba(34, 108, 255, 0.5);
          background: rgba(34, 108, 255, 0.16);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
