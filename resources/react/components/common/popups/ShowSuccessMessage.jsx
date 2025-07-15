// Popup.jsx
import React, { useEffect, useRef } from "react";

const SuccessMessagePopUp = ({ message, onClose }) => {
    const popupRef = useRef(null);

    // Close the popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={popupRef} className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-lg font-semibold mb-4">{message}</p>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-[#d97706] text-white px-4 py-2 rounded hover:bg-orange-600"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessMessagePopUp;
