import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../Config/Firebase-Config";

const FileUpload = async (file, path, setImgStatus) => {
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImgStatus && setImgStatus((prev) => ({ ...prev, progressVal: progress }));
            },
            (error) => {
                reject("Something Went Wrong!" + error?.code);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

export default FileUpload;
