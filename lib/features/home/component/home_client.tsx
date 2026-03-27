"use client";

import Sidebar from "@/lib/cores/components/sidebar";
import Topbar from "@/lib/cores/components/topbar";
import React, { useState } from "react";

export default function HomeLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeNav, setActiveNav] = useState("repository");
  const [uploadCount, setUploadCount] = useState("");

  return (
    <div className="flex h-screen overflow-hidden bg-[#111213] text-[#e8e9ea]">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
