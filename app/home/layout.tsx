"use client";

import { useState } from "react";
import RepositoryGrid from "@/lib/cores/components/repository_grid";
import Topbar from "@/lib/cores/components/topbar";
import Sidebar from "@/lib/cores/components/sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeNav, setActiveNav] = useState("repository");
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
