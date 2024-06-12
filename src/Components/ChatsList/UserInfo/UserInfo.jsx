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
import generateRandomId from "../../Common/DynamicIdGenerator";

const UserInfo = () => {
    // const [openNotifications, setOpenNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [onlyUnread, setOnlyUnread] = useState(false);
    const { currentUser } = UserUserStore();
    const { isNotificationsOpen, setNotificationsClose, toggleNotifications } = useChatStore();

    useEffect(() => {
        const getNotifications = async () => {
            const promissess = currentUser?.notifications.map(async (notification) => {
                const userRef = doc(db, "users", notification.senderId);
                const userSnap = await getDoc(userRef);
                const user = userSnap.data();

                return { ...notification, user };
            });

            const allNotifications = await Promise.all(promissess);
            setNotifications(allNotifications.sort((a, b) => b.createdAt - a.createdAt));
        };
        currentUser?.notifications?.length > 0 && getNotifications();
    }, [currentUser?.notifications]);

    const handleAccept = async (notification) => {
        const formatedNotifications = notifications.map((item) => {
            const { user, ...rest } = item;

            return rest;
        });
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
                    notifications: formatedNotifications.filter((item) => item.id !== notification.id),
                }),
            ]);
            setNotifications(notifications.filter((item) => item.id !== notification.id));
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleDecline = async (notification) => {
        const formatedNotifications = notifications.map((item) => {
            const { user, ...rest } = item;

            return rest;
        });
        const frdReqDeclineNotif = {
            id: generateRandomId(),
            senderId: currentUser.uid,
            type: 2, // type 2 indicates that declined friend request
            createdAt: Date.now(),
            isSeen: false,
            // msg: `${currentUser.name} sent you as a friend`,
        };

        const allNotif = [...formatedNotifications, frdReqDeclineNotif];
        try {
            const usersRef = collection(db, "users");

            await Promise.all([
                updateDoc(doc(usersRef, currentUser.uid), {
                    notifications: formatedNotifications.filter((item) => item.id !== notification.id),
                }),
                updateDoc(doc(usersRef, notification.senderId), {
                    notifications: allNotif.filter((item) => item.id !== notification.id),
                }),
            ]);
            setNotifications(formatedNotifications.filter((item) => item.id !== notification.id));
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const filterNotifications = () => {
        if (onlyUnread) {
            return notifications.filter((item) => item.isSeen === false);
        } else {
            return notifications;
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
                                <input
                                    id="UNREAD"
                                    type="checkbox"
                                    value={onlyUnread}
                                    onChange={(e) => setOnlyUnread(e.target.checked)}
                                />
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
                        {filterNotifications().length > 0 ? (
                            <ul>
                                {filterNotifications().map((notification, index) => {
                                    switch (notification.type) {
                                        case 1:
                                            return (
                                                <li key={index}>
                                                    <img
                                                        src={notification?.user?.avatarUrl || "./avatar.png"}
                                                        alt="avatar"
                                                    />
                                                    <div className="notification-detail">
                                                        <h5>
                                                            {`${notification.user.name} sent you friend request.`}{" "}
                                                            <span>
                                                                {DynamicDateFormatter(notification.createdAt, true)}
                                                            </span>
                                                        </h5>
                                                        <div className="actions">
                                                            <button
                                                                className="decline"
                                                                onClick={() => handleDecline(notification)}>
                                                                Decline
                                                            </button>
                                                            <button
                                                                className="accept"
                                                                onClick={() => handleAccept(notification)}>
                                                                Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="read-unread-box">
                                                        <input type="checkbox" />
                                                    </div>
                                                </li>
                                            );
                                        case 2:
                                            return (
                                                <li key={index}>
                                                    <img
                                                        src={notification?.user?.avatarUrl || "./avatar.png"}
                                                        alt="avatar"
                                                    />
                                                    <div className="notification-detail">
                                                        <h5>
                                                            {`${notification.user.name} declined your friend request.`}{" "}
                                                            <span>
                                                                {DynamicDateFormatter(notification.createdAt, true)}
                                                            </span>
                                                        </h5>
                                                    </div>
                                                </li>
                                            );

                                        default:
                                            break;
                                    }
                                })}
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
