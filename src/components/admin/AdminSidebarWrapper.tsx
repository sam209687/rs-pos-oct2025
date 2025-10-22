// src/components/admin/AdminSidebarWrapper.tsx
"use client";

import { AdminSidebar } from "./AdminSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface AdminSidebarWrapperProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function SidebarSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div
      className={cn(
        // 🛑 FIX: Removed w-20/w-64 here. It MUST use w-full to fill the parent layout's width.
        "flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 ease-in-out w-full"
      )}
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-start h-16 border-b dark:border-gray-800 px-4">
        <Skeleton className={cn("h-8 w-1/2", isCollapsed ? "hidden" : "block")} />
        <Skeleton className={cn("h-8 w-8 rounded-full", isCollapsed ? "block" : "hidden")} />
      </div>
      {/* Nav Links Skeleton */}
      <div className="flex-1 px-2 py-4 space-y-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={cn("flex items-center px-3 py-2", isCollapsed ? "justify-center" : "")}>
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className={cn("h-4 w-3/4 ml-3", isCollapsed ? "hidden" : "")} />
          </div>
        ))}
      </div>
      {/* Bottom Section Skeleton */}
      <div className={cn("px-2 py-4 border-t dark:border-gray-800", isCollapsed ? "flex flex-col items-center" : "")}>
        <div className={cn("mb-4 w-full flex", isCollapsed ? "justify-center" : "px-3 py-2")}>
          <Skeleton className="h-10 w-1/3 rounded-md" />
        </div>
        <div className={cn("flex items-center w-full px-3 py-2", isCollapsed ? "justify-center" : "")}>
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className={cn("h-4 w-1/2 ml-3", isCollapsed ? "hidden" : "")} />
        </div>
      </div>
    </div>
  );
}

export function AdminSidebarWrapper({ isCollapsed, onToggle }: AdminSidebarWrapperProps) {
  const { status } = useSession();

  if (status === "loading") {
    return <SidebarSkeleton isCollapsed={isCollapsed} />; 
  }

  // The AdminSidebar component MUST also ensure its root element uses w-full 
  // and relies on its props to handle inner layout changes.
  return <AdminSidebar isCollapsed={isCollapsed} onToggle={onToggle} />;
}