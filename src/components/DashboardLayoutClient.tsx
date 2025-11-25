"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/SideBar";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="d-flex w-100" style={{ height: "100vh" }}>
      <Sidebar />

      <div
        className="d-flex flex-column flex-grow-1 main-content"
        style={{ height: "100vh" }}
      >
        <Header />

        <main
          className="flex-grow-1 overflow-auto no-scrollbar p-3 p-md-4"
          style={{ minHeight: 0 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
