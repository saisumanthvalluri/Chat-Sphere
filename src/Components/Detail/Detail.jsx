import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { RiArrowDownSLine } from "react-icons/ri";
import { useState } from "react";
import { auth, db } from "../../Config/Firebase-Config";
import "./Detail.css";
import { useChatStore } from "../../lib/ChatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { UserUserStore } from "../../lib/UserStore";
import Modal from "../Modal/Modal";
import { toast } from "react-toastify";

const Detail = () => {
    const [openPrivacy, setOpenPrivacy] = useState(false);
    const [openMdl, setOpenMdl] = useState(false);
    const [blockMdl, setBlockMdl] = useState(false);
    const { user, toggleBlock, isCurrentUserBlocked, isReceiverBlocked, changeChat } = useChatStore();
    const { currentUser } = UserUserStore();
    const navigate = useNavigate();

    const handleOpenPrivacy = () => setOpenPrivacy((prev) => !prev);

    const onSignout = async () => {
        try {
            await signOut(auth);
            changeChat();
            navigate("/signin", { replace: true });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getTextForBlockBtn = () => {
        if (isCurrentUserBlocked) return "You are blocked !";
        return isReceiverBlocked ? "Unblock" : "Block user";
    };

    const onToggleBlock = async () => {
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                blocked: isReceiverBlocked ? arrayRemove(user.uid) : arrayUnion(user.uid),
            });
            setBlockMdl(false);
            toggleBlock();
            toast.success(`You ${isReceiverBlocked ? "unblocked" : "blocked"}  ${user?.name}`);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <div className="detail-box">
            <div className="user-detail-box">
                <img
                    src={(!(isCurrentUserBlocked || isReceiverBlocked) && user?.avatarUrl) || "/avatar.png"}
                    alt="avatar"
                />
                <span className="user-name">{user?.name || "user"}</span>
                <span className="about">{user?.about}</span>
            </div>
            <div className="actions">
                <div className="detail-item">
                    <span>Chat Settings</span>
                    <RiArrowDownSLine className="arrow-btn" />
                </div>
                <div className="detail-item">
                    <span onClick={handleOpenPrivacy}>Privacy & help</span>
                    <RiArrowDownSLine
                        onClick={handleOpenPrivacy}
                        className={openPrivacy ? "rotate arrow-btn" : "arrow-btn"}
                    />
                </div>
                {openPrivacy && (
                    <div className="detail-item-child">
                        <span>Who can see my personal info</span>

                        <div className="privacy-item">
                            <h1 className="item-name">Last seen and Online</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                        <div className="privacy-item">
                            <h1 className="item-name">Profile photo</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                        <div className="privacy-item">
                            <h1 className="item-name">About</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                        <div className="privacy-item">
                            <h1 className="item-name">Status</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                    </div>
                )}
                <div className="detail-item">
                    <span>Shared photos</span>
                    <RiArrowDownSLine className="arrow-btn" />
                </div>
                <div className="detail-item">
                    <span>Shared files</span>
                    <RiArrowDownSLine className="arrow-btn" />
                </div>
                <div className="block-logout-btn-box">
                    <button className="block-user" disabled={isCurrentUserBlocked} onClick={() => setBlockMdl(true)}>
                        {getTextForBlockBtn()}
                    </button>
                    <button className="logout" onClick={() => setOpenMdl(true)}>
                        Logout
                    </button>
                </div>
            </div>
            <Modal openMdl={blockMdl} setOpenMdl={setBlockMdl}>
                <div className="cnfm-mdl-box">
                    <h2 className="cnfm-title">{`Are you sure you want to ${isReceiverBlocked ? "unblock" : "block"} ${
                        user?.name
                    }?`}</h2>
                    <div className="yes-no-btn-box">
                        <button className="no" onClick={() => setBlockMdl(false)}>
                            No
                        </button>
                        <button className="yes" onClick={onToggleBlock}>
                            Yes
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal openMdl={openMdl} setOpenMdl={setOpenMdl}>
                <div className="cnfm-mdl-box">
                    <h2 className="cnfm-title">Are you sure you want to Logout?</h2>
                    <div className="yes-no-btn-box">
                        <button className="no" onClick={() => setOpenMdl(false)}>
                            No
                        </button>
                        <button className="yes" onClick={onSignout}>
                            Yes
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Detail;
