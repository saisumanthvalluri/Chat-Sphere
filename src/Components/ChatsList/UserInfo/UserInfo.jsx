import { BsBell } from "react-icons/bs";
import { RxAvatar } from "react-icons/rx";
import {
    MdOutlineModeEditOutline,
    MdOutlineMail,
    MdOutlineInfo,
    MdCancelPresentation,
    MdOutlineCheckBox,
} from "react-icons/md";
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
import ParallaxPixelStars from "../../Common/ParallaxPixelStars";
import FileUpload from "../../../lib/FileUpload";

const UserInfo = () => {
    // const [openNotifications, setOpenNotifications] = useState(false);
    const { currentUser } = UserUserStore();
    const [notifications, setNotifications] = useState([]);
    const [onlyUnread, setOnlyUnread] = useState(false);
    const [editStatus, setEditStatus] = useState({ name: false, about: false, email: false });
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(currentUser?.name);
    const [email, setEmail] = useState(currentUser?.email);
    const [about, setAbout] = useState(currentUser?.about || "At Work");

    const [profileOpen, setProfileOpen] = useState(false);
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

    const toggleProfileBox = () => {
        setProfileOpen((prev) => !prev);
    };

    const getUnreadNotificationsLength = () =>
        currentUser?.notifications?.filter((item) => item?.isSeen === false)?.length;

    const handleToggleEdit = (val) => {
        setEditStatus((prev) => ({ ...prev, [val]: !prev[val] }));
    };

    const onSave = async (val) => {
        try {
            const currUserRef = collection(db, "users");
            await updateDoc(doc(currUserRef, currentUser.uid), {
                [val]: val === "name" ? name : val === "about" ? about : email,
            });
            handleToggleEdit(val);
            toast.success(`${val} updated!`);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const profileAvatarHandler = async (e) => {
        setLoading(true);
        const file = e.target.files[0];
        // setProfileAvatar({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) });
        const newProfileURL = file && (await FileUpload(e.target.files[0], `userAvatars/${currentUser?.uid}`));
        await updateDoc(doc(collection(db, "users"), currentUser.uid), {
            avatarUrl: newProfileURL,
        });
        setLoading(false);
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
                <img src="edit.png" alt="edit" onClick={toggleProfileBox} className="icon" />
                <div className="bell-icon-box" onClick={toggleNotifications}>
                    <BsBell className="icon" />
                    {getUnreadNotificationsLength() > 0 && (
                        <div className="count">
                            <span>{getUnreadNotificationsLength() > 5 ? "5+" : getUnreadNotificationsLength()}</span>
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
                                                <li key={index} className={notification.isSeen ? "readed" : ""}>
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
                                                    {/* <div className="read-unread-box">
                                                        <input type="checkbox" />
                                                    </div> */}
                                                </li>
                                            );
                                        case 2:
                                            return (
                                                <li key={index} className={notification.isSeen ? "readed" : ""}>
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

                {/* Profile box starts */}
                {profileOpen && (
                    <div className="profile-edit-box">
                        <label htmlFor="PROFILE-AVATAR">
                            {!loading ? (
                                <div className="profile-img-box">
                                    <img src={currentUser?.avatarUrl || "/avatar.png"} alt="avatar" />
                                </div>
                            ) : (
                                <div className="skeleton"></div>
                            )}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            id="PROFILE-AVATAR"
                            style={{ display: "none" }}
                            onChange={(e) => profileAvatarHandler(e)}
                        />
                        <ul className="profile-detail-list">
                            <li>
                                <RxAvatar className="prof-icon" />
                                {!editStatus?.name ? (
                                    <div className="detail">
                                        <div className="lable-val-box">
                                            <span className="lable">Name</span>
                                            <span className="val">{currentUser?.name}</span>
                                            <span className="note">
                                                This is not your username or pin. This name will be visible to your
                                                friends.
                                            </span>
                                        </div>
                                        <MdOutlineModeEditOutline
                                            className="prof-edit-icon"
                                            onClick={() => handleToggleEdit("name")}
                                        />
                                    </div>
                                ) : (
                                    <div className="detail-edit-box">
                                        <label htmlFor="NAME">Name ({name.length}/14)</label>
                                        <div className="input-actions-box">
                                            <input
                                                autoFocus
                                                maxLength={14}
                                                value={name}
                                                id="NAME"
                                                type="text"
                                                placeholder="name"
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                            <MdCancelPresentation
                                                onClick={() => handleToggleEdit("name")}
                                                className="edit-action-icon cancel"
                                            />
                                            <MdOutlineCheckBox
                                                className="edit-action-icon"
                                                onClick={() => onSave("name")}
                                            />
                                        </div>
                                    </div>
                                )}
                            </li>
                            <li>
                                <MdOutlineInfo className="prof-icon" />
                                {!editStatus.about ? (
                                    <div className="detail">
                                        <div className="lable-val-box">
                                            <span className="lable">About</span>
                                            <span className="val">{currentUser?.about || "At Work"}</span>
                                        </div>
                                        <MdOutlineModeEditOutline
                                            className="prof-edit-icon"
                                            onClick={() => handleToggleEdit("about")}
                                        />
                                    </div>
                                ) : (
                                    <div className="detail-edit-box">
                                        <label htmlFor="ABOUT">About ({about?.length}/50)</label>
                                        <div className="input-actions-box">
                                            {/* <input
                                                autoFocus
                                                maxLength={50}
                                                value={about}
                                                id="ABOUT"
                                                type="text"
                                                placeholder="About"
                                                onChange={(e) => setAbout(e.target.value)}
                                            /> */}

                                            <textarea
                                                autoFocus
                                                maxLength={100}
                                                value={about}
                                                id="ABOUT"
                                                type="text"
                                                placeholder="About"
                                                name="about"
                                                cols={4}
                                                onChange={(e) => setAbout(e.target.value)}></textarea>
                                            <MdCancelPresentation
                                                onClick={() => handleToggleEdit("about")}
                                                className="edit-action-icon cancel"
                                            />
                                            <MdOutlineCheckBox
                                                className="edit-action-icon"
                                                onClick={() => onSave("about")}
                                            />
                                        </div>
                                    </div>
                                )}
                            </li>
                            <li>
                                <MdOutlineMail className="prof-icon" />
                                {!editStatus?.email ? (
                                    <div className="detail">
                                        <div className="lable-val-box">
                                            <span className="lable">Email</span>
                                            <span className="val">{currentUser?.email}</span>
                                        </div>
                                        {/* <MdOutlineModeEditOutline
                                            className="prof-edit-icon"
                                            onClick={() => handleToggleEdit("email")}
                                        /> */}
                                    </div>
                                ) : (
                                    <div className="detail-edit-box">
                                        <label htmlFor="EMAIL">Email</label>
                                        <div className="input-actions-box">
                                            <input
                                                autoFocus
                                                value={email}
                                                id="EMAIL"
                                                type="text"
                                                placeholder="sample@gmail.com"
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <MdCancelPresentation
                                                onClick={() => handleToggleEdit("email")}
                                                className="edit-action-icon cancel"
                                            />
                                            <MdOutlineCheckBox className="edit-action-icon" />
                                        </div>
                                    </div>
                                )}
                            </li>
                        </ul>
                        <ParallaxPixelStars />
                    </div>
                )}
                {/* Profile box ends */}
            </div>
        </div>
    );
};

export default UserInfo;
