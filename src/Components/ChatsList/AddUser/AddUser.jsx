import { useState } from "react";
import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import "./AddUser.css";
import { db } from "../../../Config/Firebase-Config";
import { toast } from "react-toastify";
import { UserUserStore } from "../../../lib/UserStore";
import DynamicLoader from "../../DymanicLoader/Loader";
import { useChatStore } from "../../../lib/ChatStore";

const AddUser = ({ setAddOpen }) => {
    const [searchedUser, setSearchedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chatExists, setChatExists] = useState(false);
    const audio = new Audio("/notify.mp3");
    const errorAudio = new Audio("error2.mp3");
    const { currentUser } = UserUserStore();
    const { changeChat } = useChatStore();

    const handleSearchUser = async (e) => {
        e.preventDefault();
        const name = e.target.name.value.trim();

        try {
            if (name) {
                const userRef = collection(db, "users");
                const q = query(userRef, where("name", "==", name));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const user = querySnapshot.docs[0].data();
                    setSearchedUser(user);
                    if (await checkChatExists(user)) {
                        setChatExists(true);
                    }
                } else {
                    errorAudio.play();
                    toast.warn("User Not Found!");
                }
            } else {
                errorAudio.play();
                toast.warn("Please Enter name!");
            }
        } catch (error) {
            errorAudio.play();
            console.error(error);
            toast.error(error.message);
        }
    };

    const checkChatExists = async (user) => {
        try {
            const docRef = doc(db, "userChats", currentUser.uid);
            const docSnap = await getDoc(docRef);

            const receiverIds = docSnap.data().chats.map((chat) => chat.receiverId);
            return receiverIds.includes(user.uid);
        } catch (error) {
            errorAudio.play();
            console.error(error);
            return false;
        }
    };

    const handleAddChat = async () => {
        setLoading(true);

        if (searchedUser.uid === currentUser.uid) {
            toast.warn("You can't ADD yourself!");
            setLoading(false);
            return;
        } else if (chatExists) {
            // errorAudio.play();
            // toast.warn("Chat Already Exists!");
            // setLoading(false);
            // return;

            const docRef = doc(db, "userChats", currentUser.uid);
            const docSnap = await getDoc(docRef);
            const chat = docSnap.data().chats.filter((e) => e.receiverId === searchedUser.uid && e.chatId);
            console.log(docSnap.data().chats, "curr. user chats");
            console.log(chat[0].chatId, "curr. user chatId");

            changeChat(chat[0].chatId, searchedUser);
            setAddOpen(false);
        } else {
            try {
                // const chatRef = collection(db, "chats");
                // const userChatsRef = collection(db, "userChats");
                // const newChatRef = doc(chatRef);

                // await setDoc(newChatRef, {
                //     createdAt: serverTimestamp(),
                //     messages: [],
                // });

                // const chatData = {
                //     chatId: newChatRef.id,
                //     lastMsg: { senderId: null, msg: "" },
                //     receiverId: currentUser.uid,
                //     updatedAt: Date.now(),
                //     isSeen: true,
                // };

                // await Promise.all([
                //     updateDoc(doc(userChatsRef, searchedUser.uid), { chats: arrayUnion(chatData) }),
                //     updateDoc(doc(userChatsRef, currentUser.uid), {
                //         chats: arrayUnion({ ...chatData, receiverId: searchedUser.uid }),
                //     }),
                // ]);

                const searchedUserRef = collection(db, "users");
                await updateDoc(doc(searchedUserRef, searchedUser.uid), {
                    notifications: arrayUnion({
                        senderId: currentUser.uid,
                        type: 1, // type 1 indicates that sent friend request
                        createdAt: Date.now(),
                        isSeen: false,
                        // msg: `${currentUser.name} sent you as a friend`,
                    }),
                });
                setLoading(false);
                audio.play();
                toast.success("Friend request sent!");
                setAddOpen(false);
            } catch (error) {
                errorAudio.play();
                setLoading(false);
                console.log(error);
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="add-user">
            <form onSubmit={handleSearchUser}>
                <input type="search" placeholder="Search User" name="name" />
                <button type="submit">Search</button>
            </form>
            {searchedUser && (
                <div className="search-result">
                    <img src={searchedUser.avatarUrl || "/avatar.png"} alt="avatar" />
                    <span>{searchedUser?.name}</span>
                    <button onClick={handleAddChat}>
                        {loading
                            ? DynamicLoader("RotatingLines", 20, 20, "#FFF")
                            : chatExists
                            ? "message"
                            : "Add friend"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddUser;
