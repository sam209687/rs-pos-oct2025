"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { auth } from '@/lib/auth';
import SkeltonLoader from "@/components/skelton/skelton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// AuthGuard component to handle redirection
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading

    const publicPaths = [
      "/auth",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    const isPublicPath = publicPaths.includes(pathname);

    if (session) {
      // User is logged in
      if (isPublicPath) {
        // If user is on a public page, redirect to dashboard based on role
        if (session.user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (session.user.role === "cashier") {
          router.push("/cashier/dashboard");
        }
      }
      // If logged in and not on a public path, allow access (handled by middleware for protection)
    } else {
      // User is not logged in
      if (!isPublicPath) {
        // If trying to access a protected page, redirect to login
        router.push("/auth");
      }
    }
  }, [session, status, router, pathname]);

  // Render children only if session status is not loading or if it's a public path
  // This prevents flickering or premature redirects
  if (status === "loading" && !pathname.startsWith("/auth")) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <SkeltonLoader />
      </div>
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning // Add this prop here
      >
        <ThemeProvider
          attribute="class" // Very important for Tailwind CSS
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider >
            {" "}
            {/* Wrap your app with SessionProvider */}
            <AuthGuard>{children}</AuthGuard>
            <Toaster position="bottom-right" richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}