import { useEffect, useRef, useState } from "react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";
import "./Chat.css";
import Header from "./Header/Header";
import { db } from "../../Config/Firebase-Config";
import { useChatStore } from "../../lib/ChatStore";
import { UserUserStore } from "../../lib/UserStore";
import DynamicDateFormatter from "../DynamicDateFormatter/DynamicDateFormatter";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = UserUserStore();
    // const audio = new Audio("/notify.mp3");

    const ref = useRef(null);

    useEffect(() => {
        if (!chatId) return; // Check if chatId exists, if not, return early
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            const data = res.data();
            setMessages(data.messages);
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    // useeffect for getting last msg reference
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
        // audio.play();
    }, [messages]);

    const handleSendMsg = async (e) => {
        e.preventDefault();
        if (inputMsg === "") return;

        try {
            // adding msg to chats collection
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                messages: arrayUnion({
                    senderId: currentUser.uid,
                    msg: inputMsg,
                    createdAt: Date.now(),
                }),
            });

            // updating last msg in userChats collection of both sender and receiver
            const senderReceiverIds = [user.uid, currentUser.uid];

            senderReceiverIds.forEach(async (id) => {
                const userChatsRef = doc(db, "userChats", id);
                const userChats = await getDoc(userChatsRef);

                if (userChats.exists()) {
                    const userChatsData = userChats.data();
                    const chatIndex = userChatsData?.chats?.findIndex((chat) => chat.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMsg = {
                        senderId: currentUser.uid,
                        msg: inputMsg,
                    };
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.uid ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            });
            setInputMsg("");
        } catch (error) {
            console.log(error.message);
        }
    };

    const handlePickEmoji = (emoji) => {
        setInputMsg(inputMsg + emoji.emoji);
        setPickerOpen(false);
    };

    return (
        <div
            className="chat"
            style={{
                flex: !chatId && 3,
            }}>
            {chatId ? (
                <>
                    <Header />
                    <ul className="chat-messages">
                        {messages.map((msg) => (
                            <li className={msg?.senderId === currentUser.uid ? "msg own" : "msg"} key={msg.createdAt}>
                                <img
                                    src={
                                        msg.senderId === currentUser.uid
                                            ? currentUser.avatarUrl || "/avatar.png"
                                            : user?.avatarUrl || "/avatar.png"
                                    }
                                    alt="avatar"
                                />
                                <div className="msg-time-box">
                                    <p className="msg-text">{msg?.msg}</p>
                                    <span className="msg-time">{DynamicDateFormatter(msg?.createdAt, true)}</span>
                                </div>
                            </li>
                        ))}
                        <div ref={ref}></div>
                    </ul>

                    <div className="footer">
                        {isCurrentUserBlocked || isReceiverBlocked ? (
                            <h2>{`You can not send or receive messages from ${user?.name}`}</h2>
                        ) : (
                            <>
                                <img src="/img.png" alt="img" />
                                <img src="camera.png" alt="camara" />
                                <img src="mic.png" alt="mic" />
                                <form onSubmit={(e) => handleSendMsg(e)}>
                                    <input
                                        type="text"
                                        placeholder={
                                            isCurrentUserBlocked || isReceiverBlocked
                                                ? "You can not send messages"
                                                : "Type Message..."
                                        }
                                        autoFocus
                                        name="msgText"
                                        onChange={(e) => setInputMsg(e.target.value)}
                                        value={inputMsg}
                                        autoComplete="off"
                                        disabled={isCurrentUserBlocked || isReceiverBlocked}
                                    />

                                    {/* <textarea rows={3}></textarea> */}
                                    <div className="emoji-icon-picker-box">
                                        <img
                                            src="emoji.png"
                                            alt="chat"
                                            onClick={() =>
                                                setPickerOpen((prev) =>
                                                    isCurrentUserBlocked || isReceiverBlocked ? false : !prev
                                                )
                                            }
                                        />
                                        <div className="emoji-picker">
                                            <EmojiPicker
                                                width={300}
                                                height={400}
                                                open={pickerOpen}
                                                onEmojiClick={(emoji) => handlePickEmoji(emoji)}
                                            />
                                        </div>
                                    </div>
                                    <button className="send-msg" disabled={isCurrentUserBlocked || isReceiverBlocked}>
                                        Send
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <div className="no-chat-box">
                    <img src="/no-bg-app-logo.png" alt="Logo" />

                    <h1>No Chat Selected</h1>
                    <p>Please select a chat to start conversation</p>
                </div>

                // <div className="container">
                //     <div className="cube">
                //         <div className="side front">Front</div>
                //         <div className="side back">Back</div>
                //         <div className="side right">Right</div>
                //         <div className="side left">Left</div>
                //         <div className="side top">Top</div>
                //         <div className="side bottom">Bottom</div>
                //     </div>
                // </div>

                // <div className="globe">
                //     <div className="earth"></div>
                // </div>
            )}
        </div>
    );
};

export default Chat;
