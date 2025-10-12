import { create } from 'zustand';
import { getTotalUnreadMessages } from '@/actions/message.actions';

interface NotificationStoreState {
  unreadCount: number;
  fetchUnreadCount: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  unreadCount: 0,
  fetchUnreadCount: async (userId) => {
    const result = await getTotalUnreadMessages(userId);
    if (result.success) {
      set({ unreadCount: result.count });
    }
  },
}));