"use client";

import React, { useState, useEffect } from "react";
import { CashierSidebarContent } from "./_components/CashierSidebarContent";
import { SidebarToggle } from "@/components/admin/SidebarToggle"; // Reusing the same toggle component
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PrintPreview } from "@/components/pos/PrintPreview";
import { useStoreDetailsStore } from "@/store/storeDetails.store";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { fetchActiveStore } = useStoreDetailsStore();

  // ✅ Fetch the active store details (for the logo) when the layout first loads
  useEffect(() => {
    fetchActiveStore();
  }, [fetchActiveStore]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    // ✅ Wrap the layout in the AuthGuard for security
    <AuthGuard role="cashier">
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <CashierSidebarContent
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* ✅ A persistent header for the toggle button */}
          <header className="flex items-center h-16 bg-white dark:bg-gray-950 border-b dark:border-gray-800 px-4">
            <SidebarToggle 
              isCollapsed={isSidebarCollapsed} 
              onToggle={toggleSidebar} 
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
    </AuthGuard>
  );
}