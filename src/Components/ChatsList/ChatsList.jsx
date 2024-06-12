import { useEffect, useState } from "react";
import AddUser from "./AddUser/AddUser";
import "./ChatsList.css";
import UserInfo from "./UserInfo/UserInfo";
import { UserUserStore } from "../../lib/UserStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../Config/Firebase-Config";
import { useChatStore } from "../../lib/ChatStore";
import PulseRing from "../PulseRing/PulseRing";
import DynamicDateFormatter from "../DynamicDateFormatter/DynamicDateFormatter";

const ChatsList = () => {
    const [addOpen, setAddOpen] = useState(false);
    const [chats, setChats] = useState([]);
    const [input, setInput] = useState("");

    const { currentUser } = UserUserStore();
    const { changeChat, chatId } = useChatStore();

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), async (res) => {
            const items = res.data().chats;

            // getting user info based on reciverId in the each Chat for the user
            const promisess = items.map(async (item) => {
                const userRef = doc(db, "users", item.receiverId);
                const userSnap = await getDoc(userRef);
                const user = userSnap.data();

                return { ...item, user };
            });

            const allChats = await Promise.all(promisess);
            setChats(allChats.sort((a, b) => b.updatedAt - a.updatedAt));
        });

        return () => {
            unsub();
        };
    }, [currentUser?.uid]);

    const handleAddChat = () => {
        setAddOpen((prev) => !prev);
    };

    // const getLastMsgDate = (timeStamp) => {
    //     const lastMsgDate = new Date(timeStamp);

    //     let lastMsgTime;
    //     if (new Date().toDateString() === lastMsgDate.toDateString()) {
    //         // if date is equal to today then show as 'hours:minutes'
    //         lastMsgTime = `${
    //             lastMsgDate.getHours().toString().length > 1 ? lastMsgDate.getHours() : `0${lastMsgDate.getHours()}`
    //         }:${
    //             lastMsgDate.getMinutes().toString().length > 1
    //                 ? lastMsgDate.getMinutes()
    //                 : `0${lastMsgDate.getMinutes()}`
    //         }`;
    //     } else {
    //         var yesterday = new Date(Date.now() - 864e5); // 864e5 == 86400000 == 24*60*60*1000
    //         if (yesterday.toDateString() === lastMsgDate.toDateString()) {
    //             // if date is equal to yesterday then show as 'yesterday'
    //             lastMsgTime = "Yesterday";
    //         } else {
    //             // else show the date as 'dd/mm/yyyy'
    //             lastMsgTime = lastMsgDate.toLocaleDateString().replace(/\//g, "-");
    //         }
    //     }

    //     return lastMsgTime;
    // };

    const getFilteredChats = () => {
        return chats.filter((chat) => chat?.user?.name.toLowerCase()?.includes(input?.toLowerCase()));
    };

    const handleChangeChat = async (chat) => {
        if (chat.chatId === chatId) return;
        setAddOpen(false);
        const userChats = chats.map((chat) => {
            const { user, ...rest } = chat;

            return rest;
        });

        const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

        userChats[chatIndex].isSeen = true;

        try {
            await updateDoc(doc(db, "userChats", currentUser.uid), {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (error) {
            console.log(error.message);
        }
    };

    const getLastMsgSenderName = (id) => {
        if (!id) return;
        if (id === currentUser.uid) return "You: ";
        const allUsers = chats.map((chat) => {
            const { user, ...rest } = chat;

            return user;
        });

        const userIndex = allUsers.findIndex((item) => item.uid === id);
        return `${allUsers[userIndex].name}: `;
    };

    // const getUnSeenMsgsCount = () => {
    //     const list = getFilteredChats().filter((item) => !item.isSeen);

    //     return list.length;
    // };

    return (
        <div className="chats-list">
            <UserInfo />
            <div className="search-add-box">
                <div className="search-box">
                    <img src={"/search.png"} alt="search" />
                    <input type="search" placeholder="Search..." onChange={(e) => setInput(e.target.value)} />
                </div>
                <img src={!addOpen ? "/plus.png" : "/minus.png"} alt="plus" className="add" onClick={handleAddChat} />
            </div>
            <ul className="chats">
                {getFilteredChats()?.map((chat) => (
                    <li
                        className={`chat-item ${chat.chatId === chatId && "active-chat"}`}
                        style={{
                            backgroundColor: !chat?.isSeen && "#386cf0",
                        }}
                        key={chat?.chatId}
                        onClick={() => handleChangeChat(chat)}>
                        <img src={chat.user.avatarUrl || "/avatar.png"} alt="avatar" />
                        <div className="chat-detail">
                            <div className="name-time">
                                <p className="name">{chat.user.name}</p>
                                <p className="time">{DynamicDateFormatter(chat.updatedAt, false)}</p>
                            </div>
                            <p className="last-msg">
                                {getLastMsgSenderName(chat?.lastMsg?.senderId)}{" "}
                                {chat?.lastMsg?.msg?.length <= 30
                                    ? chat?.lastMsg?.msg
                                    : `${chat?.lastMsg?.msg?.slice(0, 30)}...`}
                            </p>
                        </div>
                        {!chat.isSeen && <span>{<PulseRing />}</span>}
                    </li>
                ))}
                {/* <li className={`chat-item`}>
                    <img src={"/avatar.png"} alt="avatar" />
                    <div className="chat-detail">
                        <div className="name-time">
                            <p className="name">Hello</p>
                            <p className="time">12:00</p>
                        </div>
                    </div>
                </li>
                <li className={`chat-item`}>
                    <img src={"/avatar.png"} alt="avatar" />
                    <div className="chat-detail">
                        <div className="name-time">
                            <p className="name">Hello</p>
                            <p className="time">12:00</p>
                        </div>
                    </div>
                </li>
                <li className={`chat-item`}>
                    <img src={"/avatar.png"} alt="avatar" />
                    <div className="chat-detail">
                        <div className="name-time">
                            <p className="name">Hello</p>
                            <p className="time">12:00</p>
                        </div>
                    </div>
                </li>
                <li className={`chat-item`}>
                    <img src={"/avatar.png"} alt="avatar" />
                    <div className="chat-detail">
                        <div className="name-time">
                            <p className="name">Hello</p>
                            <p className="time">12:00</p>
                        </div>
                    </div>
                </li>
                <li className={`chat-item`}>
                    <img src={"/avatar.png"} alt="avatar" />
                    <div className="chat-detail">
                        <div className="name-time">
                            <p className="name">Hello</p>
                            <p className="time">12:00</p>
                        </div>
                    </div>
                </li>
                <li className={`chat-item`}>
                    <img src={"/avatar.png"} alt="avatar" />
                    <div className="chat-detail">
                        <div className="name-time">
                            <p className="name">Hello</p>
                            <p className="time">12:00</p>
                        </div>
                    </div>
                </li>
                <li className={`chat-item`}>
                    <img src={"/avatar.png"} alt="avatar" />
                    <div className="chat-detail">
                        <div className="name-time">
                            <p className="name">Hello</p>
                            <p className="time">12:00</p>
                        </div>
                    </div>
                </li> */}
            </ul>
            {getFilteredChats().length === 0 && (
                <div className="no-chats-box">
                    <img src={"/no-chats.png"} alt="no-chats" />
                    <p>No chats found</p>
                    <button onClick={handleAddChat}>Add new chat</button>
                </div>
            )}
            {addOpen && <AddUser setAddOpen={setAddOpen} />}
        </div>
    );
};

export default ChatsList;
