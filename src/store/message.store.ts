import { create } from 'zustand';
import { getConversations, getMessages, createMessage as createMessageAction } from '@/actions/message.actions';
import { IMessage } from '@/lib/models/message';
import { toast } from 'sonner';
import { useNotificationStore } from './notification.store';

interface IUserStub {
    _id: string;
    name: string;
    role: string;
    storeLocation?: string;
}

interface IConversation {
  user: IUserStub;
  lastMessageAt?: Date | null;
  unreadCount: number;
}

interface MessageStoreState {
    conversations: IConversation[];
    messages: IMessage[];
    activeRecipientId: string | null;
    activeRecipient: IUserStub | null;
    isLoading: boolean;
    fetchConversations: (userId: string) => Promise<void>;
    fetchMessages: (userId: string, recipientId: string) => Promise<void>;
    sendMessage: (senderId: string, recipientId: string, content: string) => Promise<void>;
    setActiveRecipient: (recipientId: string | null) => void;
}

export const useMessageStore = create<MessageStoreState>((set, get) => ({
    conversations: [],
    messages: [],
    activeRecipientId: null,
    activeRecipient: null,
    isLoading: false,

    // This action calls the new backend logic to get the correct user list
    fetchConversations: async (userId) => {
        set({ isLoading: true });
        try {
            const result = await getConversations(userId);
            if (result.success) {
                set({ conversations: result.data, isLoading: false });
            } else {
                toast.error(result.message);
                set({ isLoading: false, conversations: [] });
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
            set({ isLoading: false, conversations: [] });
        }
    },

    fetchMessages: async (userId, recipientId) => {
        set({ isLoading: true });
        try {
            const result = await getMessages(userId, recipientId);
            if (result.success) {
                set({ messages: result.data, isLoading: false });
                // After reading messages, refresh the conversation list to clear the badge
                get().fetchConversations(userId);
                useNotificationStore.getState().fetchUnreadCount(userId);
            } else {
                toast.error(result.message);
                set({ isLoading: false, messages: [] });
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            set({ isLoading: false, messages: [] });
        }
    },

    sendMessage: async (senderId, recipientId, content) => {
        const messageData = { sender: senderId, recipient: recipientId, content };
        const result = await createMessageAction(messageData);

        if (result.success) {
            const newMessage = result.data;
            set(state => ({
                messages: [...state.messages, newMessage],
            }));
            // After sending, refresh the list to show the new unread count for the other user
            get().fetchConversations(senderId);
        } else {
            toast.error(result.message);
        }
    },

    setActiveRecipient: (recipientId) => {
        const conversation = get().conversations.find(c => c.user._id === recipientId);
        const recipient = conversation ? conversation.user : null;
        set({ activeRecipientId: recipientId, activeRecipient: recipient });
    }
}));