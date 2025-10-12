// src/components/messages/ConversationList.tsx

import React from 'react';
import { Mail, Loader2, User } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// NOTE: Remember to update the 'Conversation' type in your Zustand store
// to include the 'unreadCount' property.
// For example:
// interface Conversation {
//   user: { _id: string; name: string; role: string };
//   unreadCount: number;
//   // ...other properties
// }

export function ConversationList() {
  const { conversations, isLoading, activeRecipientId, setActiveRecipient } = useMessageStore();

  return (
    <div className="w-1/4 min-w-[250px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-l-lg shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Mail className="h-6 w-6 mr-2" />
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
      <ScrollArea className="h-[calc(100%-64px)]">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations found.</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.user._id}
              onClick={() => setActiveRecipient(conv.user._id)}
              className={cn(
                "flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                activeRecipientId === conv.user._id && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <div className="flex-1">
                <p className="font-medium flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {conv.user.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{conv.user.role}</p>
              </div>
              
              {/* ====== MODIFICATION START ====== */}
              {conv.unreadCount > 0 && (
                <div className="ml-2 flex items-center justify-center">
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                </div>
              )}
              {/* ====== MODIFICATION END ====== */}
              
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}