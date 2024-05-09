import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Config/Firebase-Config";

export const UsePageStore = create((set) => ({
    currentPage: "signin",
    isLoading: false,

    setCurrentPage: (page) => set({ currentPage: page }),
    setIsLoading: (loading) => set({ isLoading: loading }),

    getCurrentUserInfo: async (uid) => {
        set({ isLoading: true });
        if (!uid) return set({ currentUser: null, isLoading: false });

        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false });
                console.log("Document data:", docSnap.data());
            } else {
                set({ currentUser: null, isLoading: false });
            }
        } catch (error) {
            console.log(error);
            return set({ currentUser: null, isLoading: false });
        }
    },
    // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    // removeAllBears: () => set({ bears: 0 }),
    // updateBears: (newBears) => set({ bears: newBears }),
}));
