import React, { useState, useRef } from "react";
import { FaKeyboard } from "react-icons/fa";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const ForgotPasswordModal = ({ onClose, onSubmit, error, successMessage }) => {
    const [email, setEmail] = useState("");
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [keyboardLayout, setKeyboardLayout] = useState("default");
    const keyboard = useRef();
    const emailRef = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email);
    };

    const handleInputFocus = () => {
        setShowKeyboard(true);
    };

    const handleKeyboardChange = (input) => {
        setEmail(input);
    };

    const handleKeyPress = (button) => {
        if (button === "{enter}") {
            setShowKeyboard(false);
            return;
        }

        if (button === "{shift}" || button === "{lock}") {
            const newLayout = keyboardLayout === "default" ? "shift" : "default";
            setKeyboardLayout(newLayout);
            return;
        }

        if (button === "{bksp}") {
            setEmail(prev => prev.slice(0, -1));
            return;
        }

        if (button === "{space}") {
            handleKeyboardChange(email + " ");
            return;
        }

        if (button === ".com") {
            handleKeyboardChange(email + ".com");
            return;
        }
    };

    const handleKeyboardHide = () => {
        setShowKeyboard(false);
    };

    // Keyboard layouts
    const keyboardLayouts = {
        default: [
            "1 2 3 4 5 6 7 8 9 0 {bksp}",
            "q w e r t y u i o p",
            "a s d f g h j k l",
            "{shift} z x c v b n m {enter}",
            "@ .com {space}"
        ],
        shift: [
            "! @ # $ % ^ & * ( ) {bksp}",
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "{shift} Z X C V B N M {enter}",
            "@ .com {space}"
        ]
    };

    // Keyboard display options
    const keyboardDisplay = {
        "{bksp}": "⌫",
        "{space}": "Space",
        "{shift}": "⇧",
        "{enter}": "Enter",
        ".com": ".com"
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-bold mb-4">Forgot Password</h3>

                {successMessage ? (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                        {successMessage}
                    </div>
                ) : (
                    <>
                        <p className="mb-4">
                            Enter email to receive a password reset link:
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="relative mb-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 pl-10"
                                    required
                                    ref={emailRef}
                                    onFocus={handleInputFocus}
                                />
                                <FaKeyboard
                                    onClick={() => {
                                        emailRef.current.focus();
                                        setShowKeyboard(!showKeyboard);
                                    }}
                                    className="cursor-pointer text-xl absolute left-2 top-1/2 transform -translate-y-1/2"
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 mb-4">{error}</p>
                            )}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#d97706] hover:bg-yellow-600 text-white px-4 py-2 rounded"
                                >
                                    Send Link
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>

            {showKeyboard && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 pb-4">
                    <div className="animate__animated animate__fadeInUp bg-white p-4 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">
                                {emailRef.current?.placeholder || 'Enter Email'}
                            </span>
                            <button
                                onClick={handleKeyboardHide}
                                className="text-gray-500 hover:text-gray-700 text-lg"
                            >
                                ×
                            </button>
                        </div>
                        <Keyboard
                            keyboardRef={r => (keyboard.current = r)}
                            layoutName={keyboardLayout}
                            layout={keyboardLayouts}
                            display={keyboardDisplay}
                            onChange={handleKeyboardChange}
                            onKeyPress={handleKeyPress}
                            buttonTheme={[
                                {
                                    class: "hg-red",
                                    buttons: "{shift}"
                                },
                                {
                                    class: "hg-green",
                                    buttons: "{enter}"
                                }
                            ]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordModal;