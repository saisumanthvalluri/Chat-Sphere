import { create } from "zustand";
import { UserUserStore } from "./UserStore";

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    isNotificationsOpen: false,

    changeChat: (chatId, user) => {
        const currentUser = UserUserStore.getState().currentUser;

        // receiver blocked current user case
        if (user?.blocked.includes(currentUser.uid)) {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        }
        // current user blocked receiver case
        else if (currentUser?.blocked.includes(user.uid)) {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        }
        // no blocked case and removing chat
        else if (!chatId && !user) {
            return set({
                chatId: null,
                user: null,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
        // no one blocked case
        else {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
    },

    toggleBlock: () => {
        set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
    },

    // notification box methods
    toggleNotifications: () => {
        set((state) => ({ ...state, isNotificationsOpen: !state.isNotificationsOpen }));
    },
    setNotificationsClose: () => {
        set((state) => ({ ...state, isNotificationsOpen: false }));
    },
    setNotificationsOpen: () => {
        set((state) => ({ ...state, isNotificationsOpen: true }));
    },
}));
