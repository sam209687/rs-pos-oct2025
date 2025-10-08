// src/components/messages/MessageBubble.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { IMessage } from '@/lib/models/message';

interface MessageBubbleProps {
  message: IMessage;
  isSender: boolean;
}

export function MessageBubble({ message, isSender }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "p-3 max-w-sm rounded-lg shadow-md break-words",
          isSender
            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-bl-none"
        )}
      >
        <p>{message.content}</p>
        <span className="text-xs mt-1 block opacity-70">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}