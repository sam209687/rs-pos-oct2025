// src/store/message.store.ts
import { create } from 'zustand';
import { getConversations, getMessages, createMessage as createMessageAction, getAllUsersForMessaging } from '@/actions/message.actions';
import { IMessage } from '@/lib/models/message';
import { toast } from 'sonner';

interface IUserStub {
    _id: string;
    name: string;
    role: string;
}

// ✅ NEW: Type for a conversation, including last message details
interface IConversation {
  user: IUserStub;
  lastMessageAt?: Date;
}

interface MessageStoreState {
    allUsers: IUserStub[]; // ✅ NEW: State for all users
    conversations: IConversation[]; // ✅ UPDATED: Conversations now use the new interface
    messages: IMessage[];
    activeRecipientId: string | null;
    activeRecipient: IUserStub | null;
    isLoading: boolean;
    fetchAllUsers: (userId: string) => Promise<void>; // ✅ NEW: Action to fetch all users
    fetchConversations: (userId: string) => Promise<void>;
    fetchMessages: (userId: string, recipientId: string) => Promise<void>;
    sendMessage: (senderId: string, recipientId: string, content: string) => Promise<void>;
    setActiveRecipient: (recipientId: string | null) => void;
}

export const useMessageStore = create<MessageStoreState>((set, get) => ({
    allUsers: [], // ✅ NEW: Initialize state
    conversations: [],
    messages: [],
    activeRecipientId: null,
    activeRecipient: null,
    isLoading: false,

    fetchAllUsers: async (userId) => {
        set({ isLoading: true });
        console.log("Fetching all users...");
        try {
            const result = await getAllUsersForMessaging();
            console.log("getAllUsersForMessaging result:", result);
            if (result.success) {
                // Filter out the current user and sort admins first
                const sortedUsers = result.data
                    .filter((u: IUserStub) => u._id !== userId)
                    .sort((a: IUserStub, b: IUserStub) => (b.role === 'admin' ? 1 : a.role === 'admin' ? -1 : 0));
                
                // Set all users as initial conversations (without last message data)
                const initialConversations = sortedUsers.map((user: IUserStub) => ({ user }));
                set({ allUsers: sortedUsers, conversations: initialConversations, isLoading: false });
                console.log("Users fetched and sorted:", sortedUsers);
            } else {
                toast.error(result.message);
                set({ isLoading: false, allUsers: [] });
            }
        } catch (error) {
            console.error("Failed to fetch all users:", error);
            set({ isLoading: false, allUsers: [] });
        }
    },

    fetchConversations: async (userId) => {
        // This action now serves to update conversation history, but initial list comes from fetchAllUsers
        // We'll update this logic in a future step if needed. For now, it remains as-is.
        // The frontend will primarily rely on fetchAllUsers
    },

    fetchMessages: async (userId, recipientId) => {
        set({ isLoading: true });
        try {
            const result = await getMessages(userId, recipientId);
            if (result.success) {
                set({ messages: result.data, isLoading: false });
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
            const newMessage = { ...result.data, createdAt: new Date() };
            set(state => ({
                messages: [...state.messages, newMessage],
            }));
            toast.success("Message sent!");
        } else {
            toast.error(result.message);
        }
    },

    setActiveRecipient: (recipientId) => {
        const recipient = get().allUsers.find(c => c._id === recipientId) || null;
        set({ activeRecipientId: recipientId, activeRecipient: recipient });
    }
}));