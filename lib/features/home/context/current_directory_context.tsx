"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { FolderModel } from "../types/folder";

type CurrentDirectoryContextValue = {
  directoryList: FolderModel[];
  pushDirectory: (newDirectory: FolderModel) => void;
};

const CurrentDirectoryContext =
  createContext<CurrentDirectoryContextValue | null>(null);

export function CurrentDirectoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [directoryList, setDirectoryList] = useState<FolderModel[]>([]);

  const pushDirectory = (newDirectory: FolderModel) => {
    setDirectoryList((currentDirectoryList) => [
      ...currentDirectoryList,
      newDirectory,
    ]);
  };

  return (
    <CurrentDirectoryContext.Provider
      value={{ directoryList, pushDirectory }}
    >
      {children}
    </CurrentDirectoryContext.Provider>
  );
}

export function useCurrentDirectory() {
  const context = useContext(CurrentDirectoryContext);

  if (!context) {
    throw new Error(
      "useCurrentDirectory must be used inside CurrentDirectoryProvider",
    );
  }

  return context;
}
