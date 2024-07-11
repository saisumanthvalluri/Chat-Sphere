import { useEffect, useRef, useState } from "react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { PiImageLight } from "react-icons/pi";
import { IoMdMic } from "react-icons/io";
import { BsEmojiWink } from "react-icons/bs";
import { TiMessages } from "react-icons/ti";
import {
    MdClose,
    // MdOutlineDownloadForOffline
} from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import "./Chat.css";
import Header from "./Header/Header";
import { db } from "../../Config/Firebase-Config";
import { useChatStore } from "../../lib/ChatStore";
import { UserUserStore } from "../../lib/UserStore";
import DynamicDateFormatter from "../DynamicDateFormatter/DynamicDateFormatter";
import DynamicIdGenator from "../Common/DynamicIdGenerator";
import { toast } from "react-toastify";
import FileUpload from "../../lib/FileUpload";
import { CircularWithValueLabel } from "../Common/CircularProgress";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [imgFile, setImgFile] = useState({ file: null, prevUrl: null, loading: false });
    const [imgStatus, setImgStatus] = useState({ loading: false, progressVal: 0 });
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = UserUserStore();

    const lastMsgRef = useRef(null);

    useEffect(() => {
        if (!chatId) return; // Check if chatId exists, if not, return early
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            const data = res.data();
            setMessages(data.messages);
        });
        handleRemoveFile();
        setInputMsg("");

        return () => {
            unSub();
        };
    }, [chatId]);

    // useeffect for getting last msg reference
    useEffect(() => {
        lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMsg = async (e) => {
        const msgId = DynamicIdGenator();
        let imgLink = null;
        e.preventDefault();
        if (inputMsg === "" && imgFile.file === null) return;
        try {
            if (imgFile.file) {
                setImgStatus((prev) => ({ ...prev, loading: true }));
                imgLink = await FileUpload(imgFile.file, `chatFiles/${chatId}/${msgId}`, setImgStatus);
                setImgStatus((prev) => ({ ...prev, loading: false }));
            }
            // adding msg to chats collection
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                messages: arrayUnion({
                    id: msgId,
                    senderId: currentUser.uid,
                    img: imgLink,
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
            handleRemoveFile();
            setInputMsg("");
        } catch (error) {
            toast.error(error?.message);
            console.log(error?.message);
        }
    };

    const handlePickEmoji = (emoji) => {
        setInputMsg(inputMsg + emoji.emoji);
        setPickerOpen(false);
    };

    const handleSetFile = (file) => {
        setImgFile((prev) => ({
            ...prev,
            file: file,
            prevUrl: file ? URL?.createObjectURL(file) : null,
        }));
    };

    const handleRemoveFile = () => {
        setImgFile({ file: null, prevUrl: null, loading: false });
    };

    // const handleDownload = async (id) => {
    //     try {
    //         const fileRef = ref(storage, `chatFiles/${chatId}/${id}`);
    //         const fileUrl = await getDownloadURL(fileRef);
    //     } catch (error) {
    //         console.error("Error downloading the image:", error);
    //     }
    // };

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
                        {messages?.length > 0 ? (
                            messages.map((msg) => (
                                <li
                                    className={msg?.senderId === currentUser.uid ? "msg own" : "msg"}
                                    key={msg.createdAt}>
                                    <img
                                        src={
                                            msg.senderId === currentUser.uid
                                                ? currentUser.avatarUrl || "/avatar.png"
                                                : user?.avatarUrl || "/avatar.png"
                                        }
                                        alt="avatar"
                                    />
                                    <div className="msg-time-box">
                                        <div className="msg-img-text-box">
                                            {msg?.img && (
                                                <div className="img-box">
                                                    {/* <MdOutlineDownloadForOffline
                                                        className="download-icon"
                                                        // onClick={() => window.open(msg?.img)}
                                                        onClick={() => handleDownload(msg.id)}
                                                    /> */}
                                                    <img src={msg?.img} alt="msg-img" />
                                                </div>
                                            )}
                                            {msg?.msg && <p>{msg?.msg}</p>}
                                        </div>
                                        <span className="msg-time">{DynamicDateFormatter(msg?.createdAt, true)}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="no-msgs-box">
                                <TiMessages className="no-msg-icon" />
                                <p className="no-msg-text">You&apos;re starting a new conversation</p>
                                <span className="no-msg-text">Type your first message below.</span>
                            </div>
                        )}
                        <div ref={lastMsgRef}></div>
                    </ul>

                    <div className="footer">
                        {isCurrentUserBlocked || isReceiverBlocked ? (
                            <h2>{`You can not send or receive messages from ${user?.name}`}</h2>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    id="SEND_IMAGE"
                                    style={{ display: "none" }}
                                    accept="image/*"
                                    onChange={(e) => handleSetFile(e?.target?.files[0])}
                                />
                                <label htmlFor="SEND_IMAGE">
                                    <PiImageLight className="footer-icons" />
                                </label>
                                <IoMdMic className="footer-icons" />
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

                                    {imgFile.prevUrl && (
                                        <div className="sent-img-box">
                                            <MdClose className="close-icon" title="cancel" onClick={handleRemoveFile} />
                                            <img src={imgFile.prevUrl} alt="img" />
                                            {imgStatus?.loading && (
                                                <div className="img-loader-box">
                                                    {CircularWithValueLabel(imgStatus?.progressVal)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="emoji-icon-picker-box">
                                        <BsEmojiWink
                                            className="footer-icons"
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
            )}
        </div>
    );
};

export default Chat;
