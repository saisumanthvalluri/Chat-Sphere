import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./Pages/Home/Home";
import { UserUserStore } from "./lib/UserStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Config/Firebase-Config";
import Toaster from "./Components/Toastify/Toastify";
import { useEffect } from "react";
import SignIn from "./Pages/Auth/SignIn/signin";
import SignUp from "./Pages/Auth/SignUp/signup";
import ForgotPassword from "./Pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword/ResetPassword";

const ChatSphere = () => {
    const { getCurrentUserInfo, setCurrentUser, currentUser } = UserUserStore();

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            if (user) {
                getCurrentUserInfo(user.uid);
            } else {
                setCurrentUser(null);
            }
        });

        return () => {
            unSub();
        };
    }, [getCurrentUserInfo, setCurrentUser]);

    // to prevent right click navigation
    useEffect(() => {
        const handleContextMenu = (event) => {
            event.preventDefault();
        };

        // Add event listener to the entire document
        document.addEventListener("contextmenu", handleContextMenu);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    return (
        <Router>
            <div className="bg-container">
                <Routes>
                    <Route path="/signin" element={currentUser ? <Navigate to="/" /> : <SignIn />} />
                    <Route path="/signup" element={currentUser ? <Navigate to="/" /> : <SignUp />} />
                    <Route path="/forgotpassword" element={currentUser ? <Navigate to="/" /> : <ForgotPassword />} />
                    <Route path="/resetpassword" element={currentUser ? <Navigate to="/" /> : <ResetPassword />} />
                    <Route path="/" element={currentUser ? <Home /> : <Navigate to="/signin" />} />
                </Routes>
            </div>
            <Toaster />
        </Router>
    );
};

export default ChatSphere;
