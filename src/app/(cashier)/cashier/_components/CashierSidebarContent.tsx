"use client";

import React, { useEffect, type ForwardRefExoticComponent, type RefAttributes } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  ClipboardList,
  Mail,
  ReceiptText,
  Settings,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/themes/ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import { useNotificationStore } from "@/store/notification.store";
import { useStoreDetailsStore } from "@/store/storeDetails.store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NavItem = {
  name: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  badge?: number;
};

interface CashierSidebarContentProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CashierSidebarContent({ isCollapsed, onToggle }: CashierSidebarContentProps) {
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

  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: "Operations",
      items: [
        { name: "POS", href: "/cashier/pos", icon: ShoppingCart },
        { name: "Invoice", href: "/cashier/invoice", icon: ReceiptText },
        { name: "Transactions", href: "/cashier/transactions", icon: ClipboardList },
      ],
    },
    {
      title: "General",
      items: [
        { 
          name: "Message", 
          href: "/cashier/message", 
          icon: Mail,
          badge: unreadCount > 0 ? unreadCount : undefined
        },
      ],
    },
  ];
  
  const user = {
    name: session?.user?.name || "Cashier",
    email: session?.user?.email || "cashier@pos.com",
    avatar: session?.user?.image || "/cashier.png",
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full bg-gray-900 text-gray-300 border-r border-gray-800 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* ✅ FIX: Updated logo section with padding, alignment, shine animation, and dynamic size */}
        <div
          className={cn(
            "flex items-center h-16 border-b dark:border-gray-800 px-4 py-2", // Added vertical padding
            isCollapsed ? "justify-center" : "justify-start" // Left-align when expanded
          )}
        >
          {activeStore?.logo ? (
            <div className="animate-shine rounded-lg">
              <Image 
                src={activeStore.logo} 
                alt="Store Logo" 
                width={isCollapsed ? 32 : 140} // Decreased collapsed size, increased expanded size
                height={isCollapsed ? 32 : 40} // Adjusted height for collapsed state
                className={cn(
                  "object-contain transition-all duration-300",
                  "brightness-125" // Increased brightness
                )}
              />
            </div>
          ) : (
            // Default icon if no logo is uploaded
            <Settings className="h-8 w-8 text-primary" />
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3
                className={cn(
                  "text-xs font-semibold text-gray-500 uppercase px-3 mb-2 transition-all duration-300",
                  isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto"
                )}
              >
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const linkContent = (
                    <div
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 relative",
                        isActive
                          ? "bg-primary/10 text-white font-semibold"
                          : "hover:bg-gray-800",
                        isCollapsed ? "justify-center" : ""
                      )}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full"></div>}
                      
                      <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                      <span className={cn("flex-1", isCollapsed ? "hidden" : "")}>{item.name}</span>
                      {item.badge && !isCollapsed && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );

                  return isCollapsed ? (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>{linkContent}</Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={5}>
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link key={item.name} href={item.href}>{linkContent}</Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-gray-800">
          <div className={cn("mb-2 w-full flex", isCollapsed ? "justify-center" : "px-3")}>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm",
              isCollapsed ? "justify-center" : ""
            )}
            onClick={handleLogout}
          >
            <Avatar className={cn("h-8 w-8", isCollapsed ? "" : "mr-3")}>
              <AvatarImage src={user.avatar} alt={user.name || ''} />
              <AvatarFallback>{user.name ? user.name.charAt(0) : 'C'}</AvatarFallback>
            </Avatar>
            <span className={cn(isCollapsed ? "hidden" : "")}>Logout</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}