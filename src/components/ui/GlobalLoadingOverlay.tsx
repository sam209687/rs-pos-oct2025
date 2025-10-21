"use client";

import { useLoadingStore } from "@/store/loading.store";
import { Loader2 } from "lucide-react";
import React from "react";

export function GlobalLoadingOverlay() {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center">
        {/* Central Spinner */}
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-primary text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}