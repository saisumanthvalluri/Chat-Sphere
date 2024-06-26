import { useChatStore } from "../../../lib/ChatStore";
import "./Header.css";

const Header = () => {
    const { user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

    return (
        <div className="chat-header">
            <div className="chat-user-info">
                <img src={(!(isCurrentUserBlocked || isReceiverBlocked) && user?.avatarUrl) || "/avatar.png"} alt="" />
                <div className="chat-user-info-text">
                    <h3>{user?.name || "User"}</h3>
                    <p>{user?.about}</p>
                </div>
            </div>
            <div className="chat-actions">
                <img src="/phone.png" alt="phone" />
                <img src="/video.png" alt="video" />
                <img src="/info.png" alt="info" />
            </div>
        </div>
    );
};

export default Header;
