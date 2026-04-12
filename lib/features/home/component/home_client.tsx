"use client";

import Sidebar from "@/lib/cores/components/sidebar";
import Topbar from "@/lib/cores/components/topbar";
import React, { useEffect, useState } from "react";
import { FileUploader } from "./file_uploader";
import { useMultiFileUpload } from "../hooks/useFileUpload";
import { useParams } from "next/navigation";
import {
  UploadRefreshProvider,
  useUploadRefresh,
} from "../context/upload_refresh_context";

function HomeLayoutContent({ children }: { children: React.ReactNode }) {
  const { notifyUploadSuccess } = useUploadRefresh();
  const params = useParams();
  const folderId = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const [activeNav, setActiveNav] = useState("repository");
  const [showUploadedSection, setShowUploadedSection] = useState(false);
  const upload = useMultiFileUpload(
    "/file/uploadFile",
    folderId,
    notifyUploadSuccess,
  );

  useEffect(() => {
    const hasActiveUpload = upload.files.some(
      (file) => file.status === "pending" || file.status === "uploading",
    );

    if (hasActiveUpload) {
      setShowUploadedSection(true);
    }
  }, [upload.files]);

  return (
    <div className="flex relative">
      <div className="flex h-screen w-full overflow-hidden bg-[#111213] text-[#e8e9ea]">
        <Sidebar
          activeItem={activeNav}
          onNavigate={setActiveNav}
          onUploadFiles={upload.addAndUploadFiles}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar
            onUploadToggle={() =>
              setShowUploadedSection((prevState) => !prevState)
            }
          />
          {children}
        </div>
      </div>
      <FileUploader
        showSection={showUploadedSection}
        files={upload.files}
        totalProgress={upload.totalProgress}
      />
    </div>
  );
}

export default function HomeLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UploadRefreshProvider>
      <HomeLayoutContent>{children}</HomeLayoutContent>
    </UploadRefreshProvider>
  );
}
