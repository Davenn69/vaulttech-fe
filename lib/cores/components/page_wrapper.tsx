import LoadingOverlay from "./loading_overlay";

type PageWrapperProps = {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
};

const PageWrapper = ({ isLoading, children, className }: PageWrapperProps) => {
  return (
    <div
      className={`w-full h-full flex content-center justify-center ${className ?? ""}`}
    >
      {isLoading && <LoadingOverlay />}
      {children}
    </div>
  );
};

export default PageWrapper;
