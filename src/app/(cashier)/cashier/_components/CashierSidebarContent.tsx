"use client";

import React from "react";
import { ShoppingCart, ClipboardList, Mail, ReceiptText } from "lucide-react";
import { BaseSidebarUI } from "@/components/shared/BaseSidebarUI";
import { useSession } from "next-auth/react";

interface CashierSidebarContentProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CashierSidebarContent({ isCollapsed, onToggle }: CashierSidebarContentProps) {
  const { data: session } = useSession();

  const navItems = [
    { name: "POS", href: "/cashier/pos", icon: ShoppingCart },
    { name: "Invoice", href: "/cashier/invoice", icon: ReceiptText },
    { name: "Transactions", href: "/cashier/transactions", icon: ClipboardList },
    { name: "Message", href: "/cashier/message", icon: Mail },
  ];
  

  const user = {
    name: session?.user?.name || "Cashier",
    email: session?.user?.email || "cashier@pos.com",
    avatar: session?.user?.image || "/cashier.png",
  };

  return (
    <BaseSidebarUI
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      navItems={navItems}
      user={user}
      logoIcon={ShoppingCart}
    />
  );
}