import { create } from "zustand";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../Config/Firebase-Config";

export const UserUserStore = create((set) => ({
    currentUser: null,
    isLoading: true,

    setIsLoading: (loading) => set({ isLoading: loading }),

    setCurrentUser: (user) => {
        set({ currentUser: user, isLoading: false });
    },

    getCurrentUserInfo: async (uid) => {
        if (!uid) return set({ currentUser: null, isLoading: false });

        try {
            const unSub = onSnapshot(doc(db, "users", uid), (res) => {
                set({ currentUser: res.data(), isLoading: false });
            });

            return () => {
                unSub();
            };
        } catch (error) {
            console.log(error);
            return set({ currentUser: null, isLoading: false });
        }
    },
}));
