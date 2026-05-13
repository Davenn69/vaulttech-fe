"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { PhotoViewer } from "../component/photo_viewer";

type PhotoViewerState = {
  src: string;
  title: string;
};

type PhotoViewerContextValue = {
  openPhotoViewer: (payload: PhotoViewerState) => void;
  closePhotoViewer: () => void;
  isPhotoViewerOpen: boolean;
  photoViewer: PhotoViewerState | null;
};

const PhotoViewerContext = createContext<PhotoViewerContextValue | null>(null);

export function PhotoViewerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [photoViewer, setPhotoViewer] = useState<PhotoViewerState | null>(null);

  const value = useMemo<PhotoViewerContextValue>(
    () => ({
      openPhotoViewer: (payload) => setPhotoViewer(payload),
      closePhotoViewer: () => setPhotoViewer(null),
      isPhotoViewerOpen: photoViewer !== null,
      photoViewer,
    }),
    [photoViewer],
  );

  return (
    <PhotoViewerContext.Provider value={value}>
      {children}
      {photoViewer?.src ? (
        <PhotoViewer
          open={photoViewer !== null}
          title={photoViewer.title}
          src={photoViewer.src}
          onClose={() => setPhotoViewer(null)}
        />
      ) : null}
    </PhotoViewerContext.Provider>
  );
}

export function usePhotoViewer() {
  const context = useContext(PhotoViewerContext);

  if (!context) {
    throw new Error("usePhotoViewer must be used inside PhotoViewerProvider");
  }

  return context;
}
