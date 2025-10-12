// src/app/(cashier)/cashier/layout.tsx
"use client";

import React, { useState } from "react";
// Removed 'Menu' import as it's no longer needed for the top header
// Removed 'Button' import if no other buttons are in the layout outside sidebar
import { CashierSidebarContent } from "./_components/CashierSidebarContent";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { PrintPreview } from "@/components/pos/PrintPreview";

interface CashierLayoutProps {
  children: React.ReactNode;
}

export default function CashierLayout({ children }: CashierLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <CashierSidebarContent
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar} // Pass the toggle function here
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
          {/* Removed the <header> with the hamburger menu */}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
          <PrintPreview />
        </div>
      </div>
    </SessionProvider>
  );
}