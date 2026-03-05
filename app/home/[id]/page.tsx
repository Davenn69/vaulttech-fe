"use client";

import { useState } from "react";
import Sidebar from "@/lib/cores/components/sidebar";
import Topbar from "@/lib/cores/components/topbar";
import RepositoryGrid from "@/lib/cores/components/repository_grid";

export default function HomePage() {
  const [activeNav, setActiveNav] = useState("repository");

  return (
    <div className="flex h-screen overflow-hidden bg-[#111213] text-[#e8e9ea]">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <RepositoryGrid />
      </div>
    </div>
  );
}
