// src/app/(cashier)/cashier/_components/CashierSidebarContent.tsx
"use client";

import React from "react";
import { LayoutDashboard, ShoppingCart, ClipboardList } from "lucide-react";
import { BaseSidebarUI } from "@/components/shared/BaseSidebarUI";
import { useSession } from "next-auth/react";

interface CashierSidebarContentProps {
  isCollapsed: boolean;
  onToggle: () => void; // New prop: function to toggle sidebar state
}

export function CashierSidebarContent({ isCollapsed, onToggle }: CashierSidebarContentProps) {
  const { data: session } = useSession();

  const navItems = [
    { name: "POS", href: "/cashier/dashboard", icon: ShoppingCart },
    { name: "Transactions", href: "/cashier/transactions", icon: ClipboardList },
  ];

  const user = {
    name: session?.user?.name || "Cashier",
    email: session?.user?.email || "cashier@pos.com",
    avatar: session?.user?.image || "/cashier.png",
  };

  return (
    <BaseSidebarUI
      isCollapsed={isCollapsed}
      onToggle={onToggle} // Pass the onToggle function
      navItems={navItems}
      user={user}
      logoIcon={ShoppingCart}
    />
  );
}