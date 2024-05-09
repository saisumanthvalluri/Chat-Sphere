import { useState } from "react";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { UserUserStore } from "../../../lib/UserStore";
import "./ResetPassword.css";
import Logo from "../../../Components/AppLogo/Logo";
import AppLoader from "../../../Components/AppLoader/AppLoader";
import DynamicLoader from "../../../Components/DymanicLoader/Loader";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../../Config/Firebase-Config";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { isLoading } = UserUserStore();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get("oobCode");

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const password = e.target.password.value;

        if (password === undefined || password === "") {
            toast.warn("Please enter a password!");
            return;
        } else if (password.length < 6) {
            toast.warn("Password must be at least 6 characters long!");
            return;
        }

        try {
            setLoading(true);
            await confirmPasswordReset(auth, oobCode, password);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate("/signin", { replace: true }), 3000);
        } catch (error) {
            if (error.message === "Firebase: Error (auth/expired-action-code).") {
                toast.error("Rest password link is expired!");
            }
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-bg">
            {isLoading && !loading ? (
                <AppLoader />
            ) : (
                <>
                    <form className="forgot-password" onSubmit={(e) => handleResetPassword(e)}>
                        <Logo />
                        <h4>Reset Password</h4>
                        <div className="password-box">
                            <input type={showPwd ? "text" : "password"} placeholder="Password" name="password" />
                            {!showPwd ? (
                                <VscEyeClosed className="eye-icon" onClick={() => setShowPwd((prev) => !prev)} />
                            ) : (
                                <VscEye className="eye-icon" onClick={() => setShowPwd((prev) => !prev)} />
                            )}
                        </div>
                        <button type="submit">
                            {loading ? DynamicLoader("RotatingLines", 30, 30, "#d1cbf1", "loading") : "Reset Password"}
                        </button>
                        <div className="seperator">
                            <hr /> <span>OR</span> <hr />
                        </div>
                        <Link className="forgot-login-link" to="/signin">
                            Sign In
                        </Link>
                    </form>
                    <div className="forgot-app-more">
                        <img src="/ChatSphereMore.png" alt="ChatSphereMore" />
                    </div>
                </>
            )}
        </div>
    );
};

export default ResetPassword;
