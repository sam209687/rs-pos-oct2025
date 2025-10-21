"use client";

import React, { useEffect, useTransition } from "react"; // 👈 ADDED useTransition
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
  Loader2, // 👈 ADDED Loader2 for button
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

// 💡 NEW IMPORT: Global Loading Store
import { useLoadingStore } from "@/store/loading.store";

interface AdminSidebarProps {
  isCollapsed: boolean;
}

export function AdminSidebar({ isCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  // 💡 NEW: Use transition for navigation
  const [isPending, startTransition] = useTransition();

  // 💡 NEW: Get setLoading function from the store
  const { setLoading } = useLoadingStore();

  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { activeStore } = useStoreDetailsStore();

  // 💡 MODIFIED: Set the global loading state when transition starts/ends
  useEffect(() => {
    setLoading(isPending);
  }, [isPending, setLoading]);


  useEffect(() => {
    if (userId) {
      fetchUnreadCount(userId);
    }
  }, [userId, fetchUnreadCount]);

  // Handler for all Link clicks
  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent the default navigation initially
    e.preventDefault(); 
    const target = e.currentTarget as HTMLAnchorElement;
    
    // Start the transition, which updates isPending to true
    startTransition(() => {
      // Manually trigger the navigation after the transition has started
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
    // You can also wrap the signOut in startTransition if the logout process itself is slow
    startTransition(async () => {
        await signOut({ callbackUrl: "/auth" });
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* ... (Logo section remains the same) ... */}
        <div
          className={cn(
            "flex items-center h-16 border-b dark:border-gray-800 px-4 py-2", 
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          {activeStore?.logo ? (
            <div className="animate-shine rounded-lg">
              <Image 
                src={activeStore.logo} 
                alt="Store Logo" 
                width={isCollapsed ? 32 : 140} 
                height={isCollapsed ? 32 : 40} 
                className={cn(
                  "object-contain transition-all duration-300",
                  "brightness-125"
                )}
              />
            </div>
          ) : (
            <Settings className="h-8 w-8 text-primary" />
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const linkContent = (
              <Link
                href={item.href}
                // 💡 MODIFIED: Use the transition handler
                onClick={handleLinkClick} 
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out group",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                <div className={cn("flex-1 flex justify-between items-center", isCollapsed ? "hidden" : "")}>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );

            return isCollapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.name}>{linkContent}</div>
            );
          })}

          {/* Product Dropdown NavLink */}
          {/* Note: DropdownMenuItem links need the onClick handler too */}
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

        <div className={cn("px-2 py-4 border-t dark:border-gray-800", isCollapsed ? "flex flex-col items-center" : "")}>
          <div className={cn("mb-4 w-full flex", isCollapsed ? "justify-center" : "px-3 py-2")}>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className={cn("w-full flex items-center justify-start rounded-md px-3 py-2", isCollapsed ? "justify-center" : "")}
            onClick={handleLogout}
            disabled={isPending} // Disable button while loading
          >
            {/* 💡 MODIFIED: Added inline spinner for logout button */}
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