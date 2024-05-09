import { useState } from "react";
import { Link } from "react-router-dom";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import Logo from "../../../Components/AppLogo/Logo";
import DynamicLoader from "../../../Components/DymanicLoader/Loader";
import "./signup.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../Config/Firebase-Config";
import { UserUserStore } from "../../../lib/UserStore";
import { doc, setDoc } from "firebase/firestore";
import FileUpload from "../../../lib/FileUpload";
import { toast } from "react-toastify";
import AppLoader from "../../../Components/AppLoader/AppLoader";

const SignUp = () => {
    const [avatar, setAvatar] = useState({ file: null, url: null });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    // const { setCurrentPage, isLoading, setIsLoading } = UsePageStore();
    const { setCurrentUser, isLoading } = UserUserStore();

    const handleChangeAvatar = (e) => {
        setAvatar({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) });
    };

    const handleSignUp = async (e) => {
        setLoading(true);
        e.preventDefault();
        const formData = new FormData(e.target);
        const { name, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            // creating user doc in db with same auth. ID
            // uploading user image in firestore with same auth. ID
            const imageUrl = (avatar.file && (await FileUpload(avatar?.file, res?.user?.uid))) || null;
            const newUser = {
                name,
                email,
                uid: res?.user?.uid,
                blocked: [],
                avatarUrl: imageUrl,
            };
            await setDoc(doc(db, "users", res?.user?.uid), newUser);

            await setDoc(doc(db, "userChats", res?.user?.uid), {
                chats: [],
            });

            // await getCurrentUserInfo(res?.user?.uid);
            setCurrentUser(newUser);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (error.message === "Firebase: Error (auth/email-already-in-use).") {
                toast.error("*This Email Adress alreay exists!");
            } else if (error.message === "Firebase: Password should be at least 6 characters (auth/weak-password).") {
                toast.error("*Password should be at least 6 characters!");
            } else if (error.message === "Firebase: Error (auth/network-request-failed).") {
                toast.error("*You are offline. please check your network!");
            } else if (error.message === "Firebase: Error (auth/invalid-email).") {
                toast.error("*Invalid email!");
            } else {
                toast.error(error.message);
                console.log(error.message);
            }
        }
    };
    return (
        <div className="signup-bg">
            {isLoading && !loading ? (
                <AppLoader />
            ) : (
                <>
                    <form className="sign-up" onSubmit={(e) => handleSignUp(e)}>
                        <Logo />
                        <h4>Create Your Account</h4>
                        <div className="upload-img-box">
                            <img src={avatar?.url || "/avatar.png"} alt="avatar" />
                            <input
                                type="file"
                                id="uploadAvatar"
                                style={{ display: "none" }}
                                onChange={(e) => handleChangeAvatar(e)}
                            />
                            <label htmlFor="uploadAvatar" className="upload-img-label">
                                Upload an Image
                            </label>
                        </div>
                        <input type="text" placeholder="Name" name="name" />
                        <input type="text" placeholder="Email" name="email" />
                        <div className="password-box">
                            <input type={showPwd ? "text" : "password"} placeholder="Password" name="password" />
                            {!showPwd ? (
                                <VscEyeClosed className="eye-icon" onClick={() => setShowPwd((prev) => !prev)} />
                            ) : (
                                <VscEye className="eye-icon" onClick={() => setShowPwd((prev) => !prev)} />
                            )}
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? DynamicLoader("RotatingLines", 30, 30, "#d1cbf1", "loading") : "Sign Up"}
                        </button>
                        <span className="link">
                            Already have an Account? <Link to="/signin">Sign In</Link>
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

export default SignUp;
