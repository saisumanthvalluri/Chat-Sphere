import { Link } from "react-router-dom";
import { BsCheck2 } from "react-icons/bs";
import "./ForgotPassword.css";
import Logo from "../../../Components/AppLogo/Logo";
import DynamicLoader from "../../../Components/DymanicLoader/Loader";
import { useState } from "react";
import { UserUserStore } from "../../../lib/UserStore";
import AppLoader from "../../../Components/AppLoader/AppLoader";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../Config/Firebase-Config";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [successStatus, setSuccessStatus] = useState(false);
    const { isLoading } = UserUserStore();

    const onResetPassword = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        try {
            if (email !== "") {
                setLoading(true);
                await sendPasswordResetEmail(auth, email);
                setLoading(false);
                toast.success("*Reset password link sent to your mail successfully!");
                setSuccessStatus(true);
            } else {
                toast.warn("*Email can not be empty!");
            }
        } catch (error) {
            setLoading(false);
            if (error.message === "Firebase: Error (auth/user-not-found).") {
                toast.warn("*user not found or user deleted!");
            } else if (error.message === "Firebase: Error (auth/network-request-failed).") {
                toast.warn("*You are offline. please check your network!");
            } else if (error.message === "Firebase: Error (auth/invalid-email).") {
                toast.warn("*Invalid email");
            } else {
                console.log(error.message);
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="forgot-bg">
            {isLoading && !loading ? (
                <AppLoader />
            ) : (
                <>
                    <form className="forgot-password" onSubmit={(e) => onResetPassword(e)}>
                        <Logo />
                        {successStatus ? (
                            <>
                                <div className="tick-box">
                                    <BsCheck2 className="tick-icon" />
                                </div>
                                <h3>Success</h3>
                                <p>
                                    Password rest link was sent successfully. Please check your email to reset your
                                    password!
                                </p>
                            </>
                        ) : (
                            <>
                                <h4>Forgot Password</h4>
                                <input type="email" placeholder="Email" name="email" />
                                <button type="submit">
                                    {loading ? DynamicLoader("RotatingLines", 30, 30, "#d1cbf1", "loading") : "Submit"}
                                </button>
                            </>
                        )}

                        <div className="seperator">
                            <hr /> <span>OR</span> <hr />
                        </div>
                        <Link to="/signin">Sign In</Link>
                    </form>
                    <div className="app-more">
                        <img src="/ChatSphereMore.png" alt="ChatSphereMore" />
                    </div>
                </>
            )}
        </div>
    );
};

export default ForgotPassword;
