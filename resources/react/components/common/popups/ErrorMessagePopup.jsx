import React, { useEffect, useRef } from "react";

const ErrorMessagePopUp = ({ message, onClose }) => {
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
            <div ref={popupRef} className="bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="p-2 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-red-600 text-center">
                        Error
                    </h2>
                </div>

                {/* Error Message */}
                <div className="px-4 py-2">
                    <p className="text-lg text-red-600 font-semibold mb-4 text-center">
                        {message}
                    </p>
                </div>

                {/* OK Button */}
                <div className="px-4 pb-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="bg-[#d97706] text-white px-4 py-2 rounded hover:bg-orange-600 w-full"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorMessagePopUp;
