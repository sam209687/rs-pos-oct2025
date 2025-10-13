"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebarWrapper } from "@/components/admin/AdminSidebarWrapper";
import { SidebarToggle } from "@/components/admin/SidebarToggle";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PrintPreview } from "@/components/pos/PrintPreview";
import { useStoreDetailsStore } from "@/store/storeDetails.store";

// Note: AuthGuard is removed as per your request to use middleware
// import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { fetchActiveStore } = useStoreDetailsStore();

  useEffect(() => {
    fetchActiveStore();
  }, [fetchActiveStore]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <AdminSidebarWrapper isCollapsed={isSidebarCollapsed} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center h-16 bg-white dark:bg-gray-950 border-b dark:border-gray-800 px-4">
          <SidebarToggle 
            // ✅ FIX: Add the missing isCollapsed prop here
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <QueryProvider>
            {children}
          </QueryProvider>
        </main>
      </div>

      <PrintPreview />
    </div>
  );
}