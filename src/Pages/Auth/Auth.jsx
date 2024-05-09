import SignIn from "./SignIn/signin";
import SignUp from "./SignUp/signup";
import "./Auth.css";
import { UsePageStore } from "../../lib/PageStore";
import ForgotPassword from "./ForgotPassword/ForgotPassword";

const Auth = () => {
    const { currentPage } = UsePageStore();

    const renderRespectivePage = () => {
        switch (currentPage) {
            case "signin":
                return <SignIn />;
            case "signup":
                return <SignUp />;
            case "forgotpassword":
                return <ForgotPassword />;
            default:
                return <SignIn />;
        }
    };

    return (
        <div className="auth">
            {renderRespectivePage()}
            <div className="app-more">
                <img src="/ChatSphereMore.png" alt="ChatSphereMore" />
            </div>
        </div>
    );
};

export default Auth;
