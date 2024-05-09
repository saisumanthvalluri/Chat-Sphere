import { useEffect, useState } from "react";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import Logo from "../../../Components/AppLogo/Logo";
import DynamicLoader from "../../../Components/DymanicLoader/Loader";
import "./signin.css";
import { UserUserStore } from "../../../lib/UserStore";
import { auth } from "../../../Config/Firebase-Config";
import { useNavigate, Link } from "react-router-dom";
import AppLoader from "../../../Components/AppLoader/AppLoader";

const SignIn = () => {
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentUser, getCurrentUserInfo, setCurrentUser, setIsLoading, isLoading } = UserUserStore();
    const errorAudio = new Audio("error2.mp3");
    const navigate = useNavigate();

    // useEffect(() => {
    //     const unSub = onAuthStateChanged(auth, (user) => {
    //         if (user) {
    //             setIsLoading(true);
    //             getCurrentUserInfo(user.uid);
    //             navigate("/", { replace: true });
    //         } else {
    //             setIsLoading(false);
    //             setCurrentUser(null);
    //             navigate("/signin", { replace: true });
    //         }
    //     });

    //     return () => {
    //         unSub();
    //     };
    // }, [getCurrentUserInfo, navigate, setCurrentUser, setIsLoading]);

    const handleSignIn = async (e) => {
        setLoading(true);
        e.preventDefault();
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            setIsLoading(true);
            if (email !== "" && password !== "") {
                const res = await signInWithEmailAndPassword(auth, email, password);
                await getCurrentUserInfo(res.user.uid);
                navigate("/", { replace: true });
                setLoading(false);
            } else {
                errorAudio.play();
                setLoading(false);
                setIsLoading(false);
                toast.error("Please enter email and password");
            }
        } catch (error) {
            errorAudio.play();
            setLoading(false);
            setIsLoading(false);
            if (error.message === "Firebase: Error (auth/user-not-found).") {
                toast.error("*User Does not exists!");
            } else if (error.message === "Firebase: Error (auth/wrong-password).") {
                toast.error("*Invalid password");
            } else if (error.message === "Firebase: Error (auth/invalid-email).") {
                toast.error("*Invalid email!");
            } else if (error.message === "Firebase: Error (auth/invalid-credential).") {
                toast.error("*Invalid credentials!");
            } else if (error.message === "Firebase: Error (auth/network-request-failed).") {
                toast.error("*You are offline. please check your network!");
            } else if (
                error.message ===
                "Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests)."
            ) {
                toast.error(
                    "*Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later!"
                );
            } else {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="signin-bg">
            {isLoading && !loading ? (
                <AppLoader />
            ) : (
                <>
                    <form className="sign-in" onSubmit={(e) => handleSignIn(e)}>
                        <Logo />
                        <h4>Welcome Back!</h4>
                        <input type="email" placeholder="Email" name="email" />
                        <div className="password-box">
                            <input type={showPwd ? "text" : "password"} placeholder="Password" name="password" />
                            {!showPwd ? (
                                <VscEyeClosed className="eye-icon" onClick={() => setShowPwd((prev) => !prev)} />
                            ) : (
                                <VscEye className="eye-icon" onClick={() => setShowPwd((prev) => !prev)} />
                            )}

                            <Link to="/forgotpassword">Forgot Password?</Link>
                        </div>
                        <button type="submit">
                            {loading ? DynamicLoader("RotatingLines", 30, 30, "#d1cbf1", "loading") : "Sign In"}
                        </button>
                        <span className="link">
                            Don&apos;t have an Account? <Link to="/signup">Sign Up</Link>
                        </span>
                    </form>
                    <div className="app-more">
                        <img src="/ChatSphereMore.png" alt="ChatSphereMore" />
                    </div>
                </>
            )}
        </div>
    );
};

export default SignIn;
