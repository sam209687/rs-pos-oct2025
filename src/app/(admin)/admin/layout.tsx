// src/app/(admin)/admin/layout.tsx
"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarToggle } from "@/components/admin/SidebarToggle";
import { useSession } from "next-auth/react"; // For session data
import { redirect } from "next/navigation"; // For client-side redirect
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PrintPreview } from "@/components/pos/PrintPreview";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { data: session, status } = useSession(); // Get session status and data

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Handle unauthenticated or non-admin users
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    // If not authenticated or not an admin, redirect to login
    redirect("/auth");
    return null; // Should not be reached due to redirect
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar for toggle (optional, can be integrated into main header later) */}
        <header className="flex items-center justify-start h-16 bg-white dark:bg-gray-950 border-b dark:border-gray-800 px-4 lg:hidden">
          {/* Only show toggle button on small screens */}
          <SidebarToggle onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          <QueryProvider>
            {children}
          </QueryProvider>
          
        </main>
        <PrintPreview />
      </div>
    </div>
  );
}