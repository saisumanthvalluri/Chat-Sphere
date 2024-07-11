import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { RiArrowDownSLine } from "react-icons/ri";
import { MdOutlineFileDownload, MdKeyboardBackspace } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useState } from "react";
import { auth, db } from "../../Config/Firebase-Config";
import "./Detail.css";
import { useChatStore } from "../../lib/ChatStore";
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { UserUserStore } from "../../lib/UserStore";
import Modal from "../Modal/Modal";
import { toast } from "react-toastify";
import { format } from "date-fns";
// import { listAll, ref, getDownloadURL } from "firebase/storage";

const Detail = () => {
    const [tabsStatus, setTabsStatus] = useState({ privacy: false, photos: true, files: false });
    const [modalsStatus, setModalsStatus] = useState({ block: false, logout: false, viewImg: false });
    const [shared, setShared] = useState({ images: [], files: [] });
    const [viewImg, setViewImg] = useState(null);
    const { user, toggleBlock, isCurrentUserBlocked, isReceiverBlocked, changeChat, chatId } = useChatStore();
    const { currentUser } = UserUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        // // Create a reference under which you want to list
        // const listRef = ref(storage, `chatFiles/${chatId}`);
        // // Find all the prefixes and items.
        // listAll(listRef)
        //     .then((res) => {
        //         // res.prefixes.forEach((folderRef) => {
        //         //     // All the prefixes under listRef.
        //         //     // You may call listAll() recursively on them.
        //         // });
        //         const imgList = [];
        //         res.items.forEach((itemRef) => {
        //             // All the items under listRef.
        //             // You may call getDownloadURL() on them to download the files.
        //             getDownloadURL(itemRef).then((url) => {
        //                 console.log(itemRef);
        //                 // `url` is the download URL for the file.
        //                 // This URL can be used to display the file in an <img> tag.
        //                 const imgItem = {
        //                     id: itemRef.name,
        //                     name: itemRef.name,
        //                     url,
        //                 };
        //                 imgList.push(imgItem);
        //             });
        //         });
        //         setShared((prev) => ({ ...prev, images: imgList }));
        //     })
        //     .catch((error) => {
        //         // Uh-oh, an error occurred!
        //         toast.error(error.message);
        //     });

        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            const data = res.data();
            const formatedMsgs = data?.messages
                ?.filter((e) => e?.img && e?.img !== null)
                ?.map((msg) => {
                    const imgItem = {
                        id: msg?.id,
                        name: getName(msg?.createdAt),
                        url: msg?.img,
                    };
                    return imgItem;
                });
            setShared((prev) => ({ ...prev, images: formatedMsgs }));
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const getName = (timeStamp) => {
        const date = new Date(timeStamp);

        const dateFormate = format(date, "dd_MM_yyyy");
        return `photo_${dateFormate}.png`;
    };

    const handleToggletabs = (tab) => setTabsStatus((prev) => ({ ...prev, [tab]: !prev[tab] }));

    const handleToggleModals = (val, img) => {
        if (img) {
            setViewImg(img);
        }
        setModalsStatus((prev) => ({ ...prev, [val]: !prev[val] }));
    };

    const onSignout = async () => {
        try {
            await signOut(auth);
            changeChat();
            navigate("/signin", { replace: true });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getTextForBlockBtn = () => {
        if (isCurrentUserBlocked) return "You are blocked !";
        return isReceiverBlocked ? "Unblock" : "Block user";
    };

    const onToggleBlock = async () => {
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                blocked: isReceiverBlocked ? arrayRemove(user.uid) : arrayUnion(user.uid),
            });
            handleToggleModals("block");
            toggleBlock();
            toast.success(`You ${isReceiverBlocked ? "unblocked" : "blocked"}  ${user?.name}`);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <div className="detail-box">
            <div className="user-detail-box">
                <img
                    src={(!(isCurrentUserBlocked || isReceiverBlocked) && user?.avatarUrl) || "/avatar.png"}
                    alt="avatar"
                />
                <span className="user-name">{user?.name || "user"}</span>
                <span className="about">{user?.about}</span>
            </div>
            <div className="actions">
                <div className="detail-item">
                    <span onClick={() => handleToggletabs("photos")}>Shared photos</span>
                    <RiArrowDownSLine
                        onClick={() => handleToggletabs("photos")}
                        className={tabsStatus?.photos ? "rotate arrow-btn" : "arrow-btn"}
                    />
                </div>

                {tabsStatus?.photos && (
                    <div className="detail-item-child">
                        {shared.images?.length > 0 ? (
                            shared.images.map((img) => (
                                <div className="shared-img-box" key={img.id}>
                                    <div className="img-name-box" onClick={() => handleToggleModals("viewImg", img)}>
                                        <img src={img.url} alt="shared img" style={{ width: "40px" }} />
                                        <span>{img.name}</span>
                                    </div>
                                    <MdOutlineFileDownload className="download-icon" />
                                </div>
                            ))
                        ) : (
                            <div className="no-items-box">
                                <span>No shared photos yet.</span>
                            </div>
                        )}
                    </div>
                )}
                <div className="detail-item">
                    <span onClick={() => handleToggletabs("files")}>Shared files</span>
                    <RiArrowDownSLine
                        onClick={() => handleToggletabs("files")}
                        className={tabsStatus?.files ? "rotate arrow-btn" : "arrow-btn"}
                    />
                </div>
                {tabsStatus?.files && (
                    <div className="detail-item-child">
                        {shared.files?.length > 0 ? (
                            shared.files.map((img) => (
                                <div className="shared-img-box" key={img.id}>
                                    <div className="img-name-box">
                                        <img src={img.url} alt="shared img" style={{ width: "40px" }} />
                                        <span>{img.name}</span>
                                    </div>
                                    <MdOutlineFileDownload className="download-icon" />
                                </div>
                            ))
                        ) : (
                            <div className="no-items-box">
                                <span>No shared files yet.</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="detail-item">
                    <span>Chat Settings</span>
                    <RiArrowDownSLine className="arrow-btn" />
                </div>
                <div className="detail-item">
                    <span onClick={() => handleToggletabs("privacy")}>Privacy & help</span>
                    <RiArrowDownSLine
                        onClick={() => handleToggletabs("privacy")}
                        className={tabsStatus?.privacy ? "rotate arrow-btn" : "arrow-btn"}
                    />
                </div>
                {tabsStatus?.privacy && (
                    <div className="detail-item-child">
                        <span>Who can see my personal info</span>

                        <div className="privacy-item">
                            <h1 className="item-name">Last seen and Online</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                        <div className="privacy-item">
                            <h1 className="item-name">Profile photo</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                        <div className="privacy-item">
                            <h1 className="item-name">About</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                        <div className="privacy-item">
                            <h1 className="item-name">Status</h1>
                            <span className="item-value">Everyone</span>
                        </div>
                    </div>
                )}
                <div className="block-logout-btn-box">
                    <button
                        className="block-user"
                        disabled={isCurrentUserBlocked}
                        onClick={() => handleToggleModals("block")}>
                        {getTextForBlockBtn()}
                    </button>
                    <button className="logout" onClick={() => handleToggleModals("logout")}>
                        Logout
                    </button>
                </div>
            </div>

            {/* block modal starts */}
            <Modal openMdl={modalsStatus?.block} setOpenMdl={() => handleToggleModals("block")}>
                <div className="cnfm-mdl-box">
                    <h2 className="cnfm-title">{`Are you sure you want to ${isReceiverBlocked ? "unblock" : "block"} ${
                        user?.name
                    }?`}</h2>
                    <div className="yes-no-btn-box">
                        <button className="no" onClick={() => handleToggleModals("block")}>
                            No
                        </button>
                        <button className="yes" onClick={onToggleBlock}>
                            Yes
                        </button>
                    </div>
                </div>
            </Modal>
            {/* block modal ends */}

            {/* logout modal starts */}
            <Modal openMdl={modalsStatus?.logout}>
                <div className="cnfm-mdl-box">
                    <h2 className="cnfm-title">Are you sure you want to Logout?</h2>
                    <div className="yes-no-btn-box">
                        <button className="no" onClick={() => handleToggleModals("logout")}>
                            No
                        </button>
                        <button className="yes" onClick={onSignout}>
                            Yes
                        </button>
                    </div>
                </div>
            </Modal>
            {/* logout modal ends */}

            {/* Image view modal starts */}
            <Modal openMdl={modalsStatus?.viewImg}>
                <div className="view-img-modal">
                    <div className="top">
                        <MdKeyboardBackspace
                            onClick={() => handleToggleModals("viewImg")}
                            className="back-icon"
                            title="back"
                        />
                        <p>{viewImg?.name}</p>
                        <BsThreeDotsVertical className="menu-icon" />
                    </div>

                    <img src={viewImg?.url} alt={viewImg?.name} />
                </div>
            </Modal>
            {/* Image view modal ends */}
        </div>
    );
};

export default Detail;
