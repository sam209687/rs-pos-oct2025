"use client";

import { AdminSidebar } from "./AdminSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface AdminSidebarWrapperProps {
  isCollapsed: boolean;
}

// This is a new skeleton component, you can place it here or in your skeletons folder
function SidebarSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-center h-16 border-b dark:border-gray-800 px-4">
        <Skeleton className={cn("h-8 w-24", isCollapsed ? "hidden" : "")} />
        <Skeleton className={cn("h-8 w-8 rounded-full", !isCollapsed ? "hidden" : "")} />
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
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        <div className={cn("flex items-center w-full px-3 py-2", isCollapsed ? "justify-center" : "")}>
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className={cn("h-4 w-1/2 ml-3", isCollapsed ? "hidden" : "")} />
        </div>
      </div>
    </div>
  );
}

export function AdminSidebarWrapper({ isCollapsed }: AdminSidebarWrapperProps) {
  const { status } = useSession();

  if (status === "loading") {
    return <SidebarSkeleton isCollapsed={isCollapsed} />;
  }

  // Once loaded, render the actual sidebar
  // Note: We are not passing the `onToggle` prop here, assuming it's managed by the parent layout
  return <AdminSidebar isCollapsed={isCollapsed} />;
}