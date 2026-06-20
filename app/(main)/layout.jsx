"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar onMenuClick={() => setSidebarOpen((p) => !p)} />
      <div className="flex flex-1" style={{ paddingTop: "var(--navbar-height)" }}>
        <Sidebar open={sidebarOpen} />
        <main
          className="flex-1 transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed)",
            minWidth: 0,
          }}
        >
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
