"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquareText } from "lucide-react";
import { ThemeToggle } from "@/components/themes/ThemeToggle";
import { motion } from "framer-motion";

export function TopBar() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Admin";

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg shadow-md">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xl font-bold text-white"
      >
        Welcome, {userName}
      </motion.h1>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
          <MessageSquareText className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <Avatar>
          <AvatarImage src={session?.user?.image || "/admin.png"} alt={userName} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}