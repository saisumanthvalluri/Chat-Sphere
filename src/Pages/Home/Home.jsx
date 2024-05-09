import { useEffect } from "react";
import Chat from "../../Components/Chat/Chat";
import ChatsList from "../../Components/ChatsList/ChatsList";
import Detail from "../../Components/Detail/Detail";
import DynamicLoader from "../../Components/DymanicLoader/Loader";
import { useChatStore } from "../../lib/ChatStore";
import { UserUserStore } from "../../lib/UserStore";
import "./Home.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../Config/Firebase-Config";
import { useNavigate } from "react-router-dom";
import AppLoader from "../../Components/AppLoader/AppLoader";

const Home = () => {
    const navigate = useNavigate();

    const { chatId } = useChatStore();
    const { getCurrentUserInfo, setCurrentUser, isLoading } = UserUserStore();

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            if (user) {
                getCurrentUserInfo(user.uid);
            } else {
                setCurrentUser(null);
                navigate("/signin", { replace: true });
            }
        });

        return () => {
            unSub();
        };
    }, [getCurrentUserInfo, navigate, setCurrentUser]);

    return (
        <div className="home-bg">
            {isLoading ? (
                <AppLoader />
            ) : (
                <>
                    <ChatsList />
                    <Chat />
                    {chatId && <Detail />}
                </>
            )}
        </div>
    );
};

export default Home;
