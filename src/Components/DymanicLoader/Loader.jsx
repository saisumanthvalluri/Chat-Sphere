import { RotatingLines, ThreeDots } from "react-loader-spinner";

const DynamicLoader = (type, width, height, color, loading) => {
    const renderRespectiveLoader = () => {
        switch (type) {
            case "RotatingLines":
                return (
                    <RotatingLines
                        visible={true}
                        height={height}
                        width={width}
                        // color={color}
                        strokeWidth="5"
                        strokeColor={color}
                        animationDuration="0.75"
                        ariaLabel="rotating-lines-loading"
                    />
                );
            case "ThreeDots":
                return (
                    <ThreeDots
                        visible={true}
                        height={height}
                        width={width}
                        color={color}
                        radius="9"
                        ariaLabel="three-dots-loading"
                    />
                );

            default:
                break;
        }
    };

    return (
        <div
            className="loader"
            style={{
                gap: loading && "8px",
            }}>
            {renderRespectiveLoader()} <span>{loading && "Loading..."}</span>
        </div>
    );
};

export default DynamicLoader;
