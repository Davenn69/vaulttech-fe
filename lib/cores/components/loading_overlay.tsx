const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-white animate-spin" />
    </div>
  );
};

export default LoadingOverlay;
