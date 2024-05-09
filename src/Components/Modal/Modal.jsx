import "./Modal.css";

const Modal = ({ children, openMdl, setOpenMdl }) => {
    return openMdl && <div className="basic-modal">{children}</div>;
};

export default Modal;