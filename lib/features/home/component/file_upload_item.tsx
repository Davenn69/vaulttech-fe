import { FileUploadState } from "../hooks/useFileUpload";

interface FileItemProps {
  item: FileUploadState;
}

const statusConfig = {
  pending: {
    bar: "bg-[#4a4d52]",
    badge: "border-[#2f3236] bg-[#1a1b1d] text-[#8b9096]",
    label: "Pending",
  },
  uploading: {
    bar: "bg-[#6c5ce7]",
    badge: "border-[#3a315f] bg-[#201c35] text-[#c5befa]",
    label: "Uploading",
  },
  success: {
    bar: "bg-[#23c16b]",
    badge: "border-[#21472f] bg-[#12251a] text-[#8ff0b8]",
    label: "Uploaded",
  },
  error: {
    bar: "bg-[#ff6b6b]",
    badge: "border-[#5c2c2c] bg-[#2c1717] text-[#ffb3b3]",
    label: "Failed",
  },
};

export function FileItem({ item }: FileItemProps) {
  const { file, progress, status, error } = item;
  const { bar, badge, label } = statusConfig[status];
  const sizeMB = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="rounded-2xl border border-[#232629] bg-[#111213] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2b2e33] bg-[#181a1c] text-sm font-semibold text-[#d7dbe0]">
          FILE
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#f1f3f5]">
                {file.name}
              </p>
              <p className="mt-1 text-xs text-[#757c85]">{sizeMB} MB</p>
            </div>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${badge}`}
            >
              {error ?? label}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#232629]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-[#757c85]">
              <span>{status === "success" ? "Uploaded" : label}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
