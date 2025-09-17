// src/components/admin/AdminSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shirt,
  LogOut,
  Settings,
  Mail,
  ChartColumnStacked,
  Ruler,
  ReceiptIndianRupee,
  UserCircle,
  Store,
  Box,
  TrendingUpDown,
  Amphora,
  BadgeIndianRupee, // Import the Box icon for Products
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/themes/ThemeToggle";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AdminSidebarProps {
  isCollapsed: boolean;
}

export function AdminSidebar({ isCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Cashiers", href: "/admin/manage-cashiers", icon: Users },
    { name: "Add Brand", href: "/admin/brand", icon: Shirt },
    { name: "Category", href: "/admin/category", icon: ChartColumnStacked },
    { name: "Unit", href: "/admin/unit", icon: Ruler },
    { name: "Oil Expeller Charges", href: "/admin/oec", icon: Amphora },
    { name: "POS", href: "/admin/pos", icon: BadgeIndianRupee },
    { name: "Messages", href: "/admin/messages", icon: Mail },
  ];

  const user = {
    name: "Admin",
    email: "admin@pos.com",
    avatar: "/admin.png",
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
      {/* Logo & Seed */}
      <div
        className={cn(
          "flex items-center justify-center h-16 border-b dark:border-gray-800",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        <h1
          className={cn(
            "text-2xl font-bold transition-all duration-300 ease-in-out",
            isCollapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
          )}
        >
          <span className="text-blue-600">POS</span>
          <span className="text-green-600">Pro</span>
        </h1>
        <Settings
          className={cn(
            "h-8 w-8 text-primary transition-all duration-300 ease-in-out",
            isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"
          )}
        />
      </div>

      {/* Nav Links */}
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
            <span
              className={cn(
                "transition-all duration-200 ease-in-out origin-left group-hover:scale-105",
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              {item.name}
            </span>
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
              <Box
                className={cn(
                  "h-5 w-5 transition-transform duration-200 ease-in-out group-hover:rotate-6",
                  isCollapsed ? "mr-0" : "mr-3"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-200 ease-in-out origin-left group-hover:scale-105",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}
              >
                Products
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 z-[99]" side="right" sideOffset={10}>
            {/* Nav link to the products page */}
            <DropdownMenuItem asChild>
              <Link
                href="/admin/products"
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/products"
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <Store className="mr-2 h-4 w-4" />
                Products
              </Link>
            </DropdownMenuItem>
            {/* Original "Unit" nav link, now a dropdown item */}
            <DropdownMenuItem asChild>
              <Link
                href="/admin/variants"
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/variants"
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <TrendingUpDown className="mr-2 h-4 w-4" />
                Create Variant
              </Link>
            </DropdownMenuItem>
            {/* New link for "Generate Batch Variants" */}
            <DropdownMenuItem asChild>
              <Link
                href="/admin/batch"
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/products/batch"
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <Box className="mr-2 h-4 w-4" />
                Generate Batch Number
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
              <Settings
                className={cn(
                  "h-5 w-5 transition-transform duration-200 ease-in-out group-hover:rotate-6",
                  isCollapsed ? "mr-0" : "mr-3"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-200 ease-in-out origin-left group-hover:scale-105",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}
              >
                Settings
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 z-[99]" side="right" sideOffset={10}>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/tax"
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/tax"
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <ReceiptIndianRupee className="mr-2 h-4 w-4" />
                Tax
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/store-settings"
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/store-settings"
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <Store className="mr-2 h-4 w-4" />
                Store Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/currency"
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/profile"
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <UserCircle className="mr-2 h-4 w-4" />
                Currency Setting
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Bottom Section: Theme Toggle & Logout */}
      <div
        className={cn(
          "px-2 py-4 border-t dark:border-gray-800",
          isCollapsed ? "flex flex-col items-center" : ""
        )}
      >
        {/* Theme Toggle */}
        <div
          className={cn(
            "mb-4 w-full flex items-center",
            isCollapsed ? "justify-center" : "px-3 py-2"
          )}
        >
          <ThemeToggle />
        </div>

        {/* Logout Button with Avatar */}
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out group",
            isCollapsed ? "justify-center" : ""
          )}
          onClick={handleLogout}
        >
          <Avatar
            className={cn(
              "h-8 w-8 transition-transform duration-200 ease-in-out group-hover:rotate-6",
              isCollapsed ? "mr-0" : "mr-3"
            )}
          >
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "transition-all duration-200 ease-in-out origin-left group-hover:scale-105",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            Logout
          </span>
        </Button>
      </div>
    </div>
  );
}