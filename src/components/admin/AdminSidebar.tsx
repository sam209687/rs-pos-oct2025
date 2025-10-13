"use client";

import React, { useEffect } from "react";
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

interface AdminSidebarProps {
  isCollapsed: boolean;
}

export function AdminSidebar({ isCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { activeStore } = useStoreDetailsStore();

  useEffect(() => {
    if (userId) {
      fetchUnreadCount(userId);
    }
  }, [userId, fetchUnreadCount]);

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
    await signOut({ callbackUrl: "/auth" });
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center h-16 border-b dark:border-gray-800",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {isCollapsed ? (
          activeStore?.logo ? (
            <Image src={activeStore.logo} alt="Logo" width={32} height={32} className="object-contain" />
          ) : (
             <Settings className="h-8 w-8 text-primary" />
          )
        ) : (
          activeStore?.logo ? (
            <Image src={activeStore.logo} alt={activeStore.storeName} width={120} height={40} className="object-contain" />
          ) : (
            <h1 className="text-2xl font-bold">
              <span className="text-blue-600">POS</span>
              <span className="text-green-600">Pro</span>
            </h1>
          )
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out group",
              pathname === item.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 transition-transform duration-200 ease-in-out group-hover:rotate-6",
                isCollapsed ? "mr-0" : "mr-3"
              )}
            />
            <div className={cn("flex-1 flex justify-between items-center", isCollapsed ? "hidden" : "")}>
              <span>{item.name}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        ))}

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
              <span className={cn("flex-1 text-left", isCollapsed ? "hidden" : "")}>
                Products
              </span>
            </button>
          </DropdownMenuTrigger>
          {/* ✅ FIX: Restored the dropdown menu items */}
          <DropdownMenuContent className="w-56 z-[99]" side="right" sideOffset={10}>
            <DropdownMenuItem asChild>
              <Link href="/admin/products">
                <Store className="mr-2 h-4 w-4" />
                Products
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/variants">
                <TrendingUpDown className="mr-2 h-4 w-4" />
                Create Variant
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/batch">
                <Box className="mr-2 h-4 w-4" />
                Generate Batch
              </Link>
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
              <span className={cn("flex-1 text-left", isCollapsed ? "hidden" : "")}>
                Settings
              </span>
            </button>
          </DropdownMenuTrigger>
          {/* ✅ FIX: Restored the dropdown menu items */}
          <DropdownMenuContent className="w-56 z-[99]" side="right" sideOffset={10}>
             <DropdownMenuItem asChild>
              <Link href="/admin/tax">
                <ReceiptIndianRupee className="mr-2 h-4 w-4" />
                Tax
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/store-settings">
                <Store className="mr-2 h-4 w-4" />
                Store Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/currency">
                <UserCircle className="mr-2 h-4 w-4" />
                Currency Setting
              </Link>
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
        >
          <Avatar className={cn("h-8 w-8", isCollapsed ? "mr-0" : "mr-3")}>
            <AvatarImage src={user.avatar} alt={user.name || ''} />
            <AvatarFallback>{user.name ? user.name.charAt(0) : 'A'}</AvatarFallback>
          </Avatar>
          <span className={cn(isCollapsed ? "hidden" : "")}>Logout</span>
        </Button>
      </div>
    </div>
  );
}