// src/components/adminPanel/dashboard/AdminSidebarContent.tsx
"use client";

import React, { useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shirt,
  Settings,
  Mail,
  ChartColumnStacked,
  Ruler,
  BadgeIndianRupee,
  Store,
  Box,
  TrendingUpDown,
  Amphora,
  ReceiptIndianRupee,
  UserCircle,
  ReceiptText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/themes/ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNotificationStore } from "@/store/notification.store";
import { useStoreDetailsStore } from "@/store/storeDetails.store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLoadingStore } from "@/store/loading.store";


interface AdminSidebarContentProps {
  isCollapsed: boolean;
  onCollapseToggle: () => void; // Added for the internal toggle button
}

export function AdminSidebarContent({ isCollapsed, onCollapseToggle }: AdminSidebarContentProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [isPending, startTransition] = useTransition();
  const { setLoading } = useLoadingStore();

  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { activeStore } = useStoreDetailsStore();

  useEffect(() => {
    setLoading(isPending);
  }, [isPending, setLoading]);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount(userId);
    }
  }, [userId, fetchUnreadCount]);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    const target = e.currentTarget as HTMLAnchorElement;
    
    startTransition(() => {
      window.location.href = target.href;
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Cashiers", href: "/admin/manage-cashiers", icon: Users },
    { name: "Add Brand", href: "/admin/brand", icon: Shirt },
    { name: "Category", href: "/admin/category", icon: ChartColumnStacked },
    { name: "Unit", href: "/admin/unit", icon: Ruler },
    { name: "Oil Expeller Charges", href: "/admin/oec", icon: Amphora },
    { name: "POS", href: "/admin/pos", icon: BadgeIndianRupee },
    { name: "Invoice", href: "/admin/invoice", icon: ReceiptText },
    { 
      name: "Messages", 
      href: "/admin/messages", 
      icon: Mail, 
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
  ];

  const user = {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@pos.com",
    avatar: session?.user?.image || "/admin.png",
  };

  const handleLogout = async () => {
    startTransition(async () => {
        await signOut({ callbackUrl: "/auth" });
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          // ✅ FIX: Removed explicit w-20/w-64 classes. Use w-full to fill the width set by the parent layout.
          "flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 ease-in-out w-full"
        )}
      >
        {/* === Logo & Toggle Button Section (Now within sidebar) === */}
        <div
          className={cn(
            "flex items-center h-16 border-b dark:border-gray-800 px-4 py-2 relative", // relative for toggle
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
            {/* Logo (Reduced Size) */}
            {activeStore?.logo ? (
                <div className="animate-shine rounded-lg transition-all duration-300">
                    <Image 
                        src={activeStore.logo} 
                        alt="Store Logo" 
                        width={isCollapsed ? 32 : 100} // Reduced logo size
                        height={isCollapsed ? 32 : 32} 
                        className={cn(
                        "object-contain transition-all duration-300",
                        "brightness-125"
                        )}
                    />
                </div>
            ) : (
                <Settings className="h-6 w-6 text-primary" /> // Reduced icon size
            )}

            {/* Toggle Button (Desktop Only) */}
            {!isCollapsed && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={onCollapseToggle}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 transform rotate-180" // Rotated chevron
                    >
                        <path d="m15 18-6-6 6-6"/>
                    </svg>
                </Button>
            )}
            {/* Toggle icon when collapsed (Desktop Only) */}
            {isCollapsed && (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-primary bg-gray-500 dark:bg-primary dark:text-primary-foreground border dark:border-gray-700 shadow-lg hover:bg-gray-500 dark:hover:bg-primary/90 transition-all duration-300 z-10 hidden lg:flex"
                            onClick={onCollapseToggle}
                        >
                            <svg
                                
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="m15 18-6-6 6-6"/>
                            </svg>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Expand Sidebar
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
        {/* ======================================================= */}

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const linkContent = (
              <Link
                href={item.href}
                onClick={handleLinkClick} 
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out group",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md" // Added subtle shadow
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                <div className={cn("flex-1 flex justify-between items-center", isCollapsed ? "hidden" : "")}>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );

            return isCollapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={15}>
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.name}>{linkContent}</div>
            );
          })}

          {/* Product Dropdown NavLink */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out group",
                  "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <Box className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn("flex-1 text-left", isCollapsed ? "hidden" : "")}>Products</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[99]" side="right" sideOffset={10}>
              <DropdownMenuItem asChild>
                <Link href="/admin/products" onClick={handleLinkClick}><Store className="mr-2 h-4 w-4" />Products</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/variants" onClick={handleLinkClick}><TrendingUpDown className="mr-2 h-4 w-4" />Create Variant</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/batch" onClick={handleLinkClick}><Box className="mr-2 h-4 w-4" />Generate Batch</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Dropdown NavLink */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <button
                className={cn(
                  "w-full flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out group",
                  "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn("flex-1 text-left", isCollapsed ? "hidden" : "")}>Settings</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[99]" side="right" sideOffset={10}>
               <DropdownMenuItem asChild>
                <Link href="/admin/tax" onClick={handleLinkClick}><ReceiptIndianRupee className="mr-2 h-4 w-4" />Tax</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/store-settings" onClick={handleLinkClick}><Store className="mr-2 h-4 w-4" />Store Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/currency" onClick={handleLinkClick}><UserCircle className="mr-2 h-4 w-4" />Currency Setting</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/packingProds" onClick={handleLinkClick}><UserCircle className="mr-2 h-4 w-4" />Packing Details</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* === Footer Section === */}
        <div className={cn("px-2 py-4 border-t dark:border-gray-800", isCollapsed ? "flex flex-col items-center" : "")}>
          <div className={cn("mb-4 w-full flex", isCollapsed ? "justify-center" : "px-3 py-2")}>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className={cn("w-full flex items-center justify-start rounded-md px-3 py-2", isCollapsed ? "justify-center" : "")}
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isCollapsed ? "" : "mr-3")} />
            ) : (
                <Avatar className={cn("h-8 w-8", isCollapsed ? "mr-0" : "mr-3")}>
                  <AvatarImage src={user.avatar} alt={user.name || ''} />
                  <AvatarFallback>{user.name ? user.name.charAt(0) : 'A'}</AvatarFallback>
                </Avatar>
            )}
            <span className={cn(isCollapsed ? "hidden" : "")}>{isPending ? "Signing Out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}