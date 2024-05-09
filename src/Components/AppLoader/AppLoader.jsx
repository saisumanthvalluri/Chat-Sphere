import DynamicLoader from "../DymanicLoader/Loader";
import "./AppLoader.css";

const AppLoader = () => {
    return (
        <div className="loading-box">
            {DynamicLoader("RotatingLines", 40, 40, "#FFF")} <span>Loading...</span>
        </div>
    );
};

export default AppLoader;
