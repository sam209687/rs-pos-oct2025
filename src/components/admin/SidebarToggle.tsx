// src/components/admin/SidebarToggle.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface SidebarToggleProps {
  onToggle: () => void;
}

export function SidebarToggle({ onToggle }: SidebarToggleProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}