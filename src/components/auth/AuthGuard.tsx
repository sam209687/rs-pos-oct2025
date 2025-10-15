"use client";

import { useSession } from "next-auth/react";
// import { redirect } from "next-navigation";
import { Loader2 } from "lucide-react";
import React from "react";
import { redirect } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  role: "admin" | "cashier";
}

export function AuthGuard({ children, role }: AuthGuardProps) {
  const { data: session, status } = useSession();

  // 1. While the session is loading, show a full-screen spinner.
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // 2. If the user is not authenticated or doesn't have the correct role, redirect to login.
  if (status === "unauthenticated" || session?.user?.role !== role) {
    redirect("/auth");
  }

  // 3. If the session is authenticated and the role is correct, show the page content.
  return <>{children}</>;
}