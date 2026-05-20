export function normalizeExtension(extension?: string) {
  return (extension ?? "").replace(/^\./, "").toLowerCase();
}

export function formatDate(value?: string) {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export function formatSize(size?: number) {
  if (size == null || !Number.isFinite(size)) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  return `${currentSize.toFixed(currentSize >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getPreviewMode(extension?: string) {
  const normalizedExtension = normalizeExtension(extension);

  if (
    ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif"].includes(
      normalizedExtension,
    )
  ) {
    return "image";
  }

  if (normalizedExtension === "pdf") {
    return "pdf";
  }

  return "document";
}
