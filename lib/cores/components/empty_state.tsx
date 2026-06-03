type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-dashed border-[#2b2e33] bg-[#111213] px-6 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2a2c2e] bg-[#16181a] text-[#d7dbe0]">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#f6f7f8]">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8b9096]">
          {description}
        </p>
      </div>
    </div>
  );
}
