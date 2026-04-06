"use client";

import { createContext, useContext, useState } from "react";

type UploadRefreshContextValue = {
  refreshTick: number;
  notifyUploadSuccess: () => void;
};

const UploadRefreshContext = createContext<UploadRefreshContextValue | null>(
  null,
);

export function UploadRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshTick, setRefreshTick] = useState(0);

  return (
    <UploadRefreshContext.Provider
      value={{
        refreshTick,
        notifyUploadSuccess: () => setRefreshTick((prev) => prev + 1),
      }}
    >
      {children}
    </UploadRefreshContext.Provider>
  );
}

export function useUploadRefresh() {
  const context = useContext(UploadRefreshContext);

  if (!context) {
    throw new Error(
      "useUploadRefresh must be used inside UploadRefreshProvider",
    );
  }

  return context;
}
