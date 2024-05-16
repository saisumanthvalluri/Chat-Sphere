import { BsBell } from "react-icons/bs";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { UserUserStore } from "../../../lib/UserStore";
import "./UserInfo.css";
import { useEffect, useState } from "react";
import { arrayUnion, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../Config/Firebase-Config";
import DynamicDateFormatter from "../../DynamicDateFormatter/DynamicDateFormatter";
import { toast } from "react-toastify";
import { useChatStore } from "../../../lib/ChatStore";

const UserInfo = () => {
    // const [openNotifications, setOpenNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { currentUser } = UserUserStore();
    const { isNotificationsOpen, setNotificationsClose, toggleNotifications } = useChatStore();

    useEffect(() => {
        const getNotifications = async () => {
            if (currentUser?.notifications?.length === 0) return;

            const promissess = currentUser?.notifications.map(async (notification) => {
                const userRef = doc(db, "users", notification.senderId);
                const userSnap = await getDoc(userRef);
                const user = userSnap.data();

                return { ...notification, user };
            });

            const allNotifications = await Promise.all(promissess);
            setNotifications(allNotifications.sort((a, b) => b.createdAt - a.createdAt));
        };
        getNotifications();
    }, [currentUser?.notifications]);

    const handleAccept = async (notification) => {
        try {
            const chatRef = collection(db, "chats");
            const userChatsRef = collection(db, "userChats");
            const usersRef = collection(db, "users");
            const newChatRef = doc(chatRef);
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });
            const chatData = {
                chatId: newChatRef.id,
                lastMsg: { senderId: null, msg: "" },
                receiverId: currentUser.uid,
                updatedAt: Date.now(),
                isSeen: true,
            };
            await Promise.all([
                updateDoc(doc(userChatsRef, notification?.user?.uid), { chats: arrayUnion(chatData) }),
                updateDoc(doc(userChatsRef, currentUser.uid), {
                    chats: arrayUnion({ ...chatData, receiverId: notification?.user?.uid }),
                }),
                updateDoc(doc(usersRef, currentUser.uid), {
                    notifications: notifications.filter(
                        (item) => item.senderId !== notification.senderId && item.type !== 1
                    ),
                }),
            ]);
            setNotifications(
                notifications.filter((item) => item.senderId !== notification.senderId && item.type !== 1)
            );
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <div className="user-info">
            <div className="detail">
                <img src={currentUser?.avatarUrl || "/avatar.png"} alt="avatar" />
                <span className="user-name">{currentUser?.name}</span>
            </div>
            <div className="actions">
                {/* <img src="/more.png" alt="more" /> */}
                {/* <img src="/video.png" alt="video" /> */}
                <img src="edit.png" alt="edit" />
                <div className="bell-icon-box" onClick={toggleNotifications}>
                    <BsBell className="icon" />
                    {currentUser?.notifications?.length > 0 && (
                        <div className="count">
                            <span>
                                {currentUser?.notifications?.length > 5 ? "5+" : currentUser?.notifications?.length}
                            </span>
                        </div>
                    )}
                </div>
                {/* notifications box starts */}
                {isNotificationsOpen && (
                    <div className="notifications-modal">
                        <div className="title-box">
                            <h3>Notifications</h3>
                            <label className="unread-lbl" htmlFor="UNREAD">
                                Show only unread
                            </label>
                            <label className="switch">
                                <input id="UNREAD" type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                            <IoIosCloseCircleOutline
                                className="close-icon"
                                onClick={setNotificationsClose}
                                title="close"
                            />
                        </div>
                        {notifications.length > 0 && (
                            <div className="latest-mark-box">
                                <span className="latest">LATEST</span>
                                <span className="mark-as-read-text">Mark all as read</span>
                            </div>
                        )}
                        {notifications.length > 0 ? (
                            <ul>
                                {notifications.map((notification, index) => (
                                    <li key={index}>
                                        <img src={notification?.user?.avatarUrl || "./avatar.png"} alt="avatar" />
                                        <div className="notification-detail">
                                            <h5>
                                                {`${notification.user.name} sent you friend request.`}{" "}
                                                <span>{DynamicDateFormatter(notification.createdAt, true)}</span>
                                            </h5>
                                            <div className="actions">
                                                <button className="decline">Decline</button>
                                                <button className="accept" onClick={() => handleAccept(notification)}>
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                        <div className="read-unread-box">
                                            <input type="checkbox" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-notif-box">
                                <img src="/no-notifications.png" alt="" />
                                <p>You don&apos;t have any notifications</p>
                            </div>
                        )}
                    </div>
                )}
                {/* notifications box ends */}
            </div>
        </div>
    );
};

export default UserInfo;
