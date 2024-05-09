import React, { useState, useRef } from "react";

const CameraCapture = () => {
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef();

    const handleCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            setCameraStream(stream);
            videoRef.current.srcObject = stream;
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const handleStopCapture = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
        }
    };

    return (
        <div>
            <button onClick={handleCapture}>Capture Photo</button>
            {cameraStream && (
                <>
                    <video ref={videoRef} autoPlay={true} width="200" height="200" />
                    <button onClick={handleStopCapture}>Stop Capture</button>
                </>
            )}
        </div>
    );
};

export default CameraCapture;
