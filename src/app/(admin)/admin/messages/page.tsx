// src/app/(admin)/admin/messages/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useMessageStore } from '@/store/message.store';
import { useAuth } from '@/hooks/use-auth';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { Loader2 } from 'lucide-react';

export default function AdminMessagesPage() {
  const { user, isLoading } = useAuth();
  const userId = user?._id;
  const { fetchAllUsers, fetchMessages, activeRecipientId } = useMessageStore();

  useEffect(() => {
    if (!isLoading && userId) {
      fetchAllUsers(userId);
    }
  }, [userId, isLoading, fetchAllUsers]);

  useEffect(() => {
    if (!isLoading && userId && activeRecipientId) {
      fetchMessages(userId, activeRecipientId);
    }
  }, [userId, activeRecipientId, isLoading, fetchMessages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-6 bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-red-500 text-center min-h-[calc(100vh-64px)] p-6">
        Please log in to view messages.
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] p-6 text-gray-900 dark:text-gray-50 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-950 dark:to-gray-800">
      <ConversationList />
      <ChatWindow />
    </div>
  );
}