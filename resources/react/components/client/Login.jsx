import React, { useState, useRef, useEffect } from "react";
import { FaKeyboard } from "react-icons/fa";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { productApi } from "../../lib/services";
import { useNavigate } from "react-router-dom";
import UnauthorizedAccess from "./UnauthorizedAccess";
import ForgotPasswordModal from "../common/ForgotPasswordModal"


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState("default");
  const keyboard = useRef();
  const currentInputRef = useRef(null);
  const formRef = useRef();

  const navigate = useNavigate();

  const emailRef = useRef();
  const passwordRef = useRef();

  const handleInputFocus = (inputField, inputRef) => {
    currentInputRef.current = inputRef;
    setShowKeyboard(true);
  };

  const handleKeyboardChange = (input) => {
    if (currentInputRef.current) {
      const inputName = currentInputRef.current.id;
      const setterMap = {
        "email": setEmail,
        "password": setPassword
      };

      if (setterMap[inputName]) {
        setterMap[inputName](input);
      }
    }
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
      if (currentInputRef.current) {
        const inputName = currentInputRef.current.id;
        const setterMap = {
          "email": setEmail,
          "password": setPassword
        };
        
        if (setterMap[inputName]) {
          setterMap[inputName](prev => prev.slice(0, -1));
        }
      }
      return;
    }

    if (button === "{space}") {
      handleKeyboardChange((currentInputRef.current?.value || "") + " ");
      return;
    }

    if (button === ".com") {
      handleKeyboardChange((currentInputRef.current?.value || "") + ".com");
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

  // Updated input change handlers
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const checkScreenAuthentication = async () => {
    try {
      const mac_address = await window.macElectronAPI.getMacAddress();

      if (!mac_address) {
        console.error("MAC Address not Found!");
        setIsAuthorized(false);
        return false;
      }

      const payload = { mac: mac_address };
      const response = await productApi.checkScreenAuthentication(payload);

      if (response?.data?.message === "Screen Found") {
        setIsAuthorized(true);
        const screens = response?.data?.screens_with_pay_machine_ip || [];
        if (screens.length > 0) {
          localStorage.setItem("Screens_Data", JSON.stringify(screens));
        
        } else {
          console.warn("No screens_with_pay_machine_ip Data Found!");
          
        }
                  return true;
      } else {
        console.log("Screen Not Found or Different Response:", response.data);
        setIsAuthorized(false);
        return false;
      }
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error.message);
      setIsAuthorized(false);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await productApi.loginEmploye(email, password);

      if (!response.data.success) {
        setError(response.data?.message || "Invalid Credentials");
        return;
      }

      if (response?.data?.data?.employee_id) {
        const employeeId = response.data.data.employee_id;
        localStorage.setItem("EmployeId", response?.data?.data?.employee_id);
        localStorage.setItem("Token", response?.data?.data?.token);
        const isAuthorized = await checkScreenAuthentication();

        if (!isAuthorized) {
        setIsAuthorized(false);
        return; // Don't navigate if not authorized
      }

        if (rememberMe) {
          if (email !== localStorage.getItem("email") || password !== localStorage.getItem("password")) {
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);
          }
        }

        try {
          const EmpId = Number(employeeId);
          const startTillResponse = await productApi.checkTillStart({ user_id: EmpId });
          console.log("Till Start API Response:", startTillResponse.data);
        } catch (tillStartError) {
          console.error("Error while starting till:", tillStartError);
        }

        let tillStatsValid = false;
        try {
          const checkTillStatsResponse = await productApi.checkCurrentStats();
          console.log("Till Stats Current API Response:", checkTillStatsResponse.data);

          if (checkTillStatsResponse?.data?.success === true) {
            tillStatsValid = true;
          } else {
            setError("Till stats check failed. Please try again.");
          }
        } catch (error) {
          console.error("Error checking till stats:", error);
          setError("Error checking till status. Please try again.");
        }

        navigate("/");

      } else {
        setError("Invalid login Credentials");
      }
    } catch (err) {
      if (err.includes("401")) {
        setError("Invalid login Credentials");
        return;
      }
      setError(err.message || err);
      console.error(err.message || err);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      const response = await productApi.forgotPassword({ email });
      if (response.data?.success) {
        setSuccessMessage(response.data?.message);
        setTimeout(() => {
          setShowForgotPasswordModal(false);
          setSuccessMessage("");
        }, 3000);
      } else {
        setError(response.data?.message || "User Not Found");
      }
    } catch (error) {
      setError(error || "Something went wrong");
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  if (isAuthorized === false) {
    return <UnauthorizedAccess />;
  }

  return (
    <>
      <div className="h-screen m-0 p-0">
        <div
          className="h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://img.freepik.com/free-photo/front-view-yummy-meat-cheeseburger-with-french-fries-dark-background-dinner-burger-snack-fast-food-sandwich-salad-dish-toasts_140725-159227.jpg?t=st=1737577564~exp=1737581164~hmac=a3500002baed58daf82952cd372db61a588e544efffb2e9759ff151252c2e91f&')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="flex items-center justify-center h-full" ref={formRef}>
            <div className="w-96 sm:w-96 md:w-1/3 p-6 bg-white shadow-lg rounded-md relative">
              <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-0 mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Or Username
                  </label>
                  <div className="mb-4 mt-0 relative">
                    <input
                      type="text"
                      id="email"
                      name="email"
                      ref={emailRef}
                      required
                      className="w-full mt-1 px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 pl-12"
                      placeholder="Enter your Email or Username"
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={() => handleInputFocus("email", emailRef.current)}
                    />
                    <FaKeyboard
                      onClick={() => {
                        emailRef.current.focus();
                        setShowKeyboard(!showKeyboard);
                      }}
                      className="cursor-pointer text-2xl absolute left-3 top-1/2 transform -translate-y-1/2"
                    />
                  </div>
                </div>
                <div className="mb-4 mt-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mb-4 mt-0 relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      ref={passwordRef}
                      required
                      className="w-full mt-1 px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 pl-12"
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => handleInputFocus("password", passwordRef.current)}
                    />
                    <FaKeyboard
                      onClick={() => {
                        passwordRef.current.focus();
                        setShowKeyboard(!showKeyboard);
                      }}
                      className="cursor-pointer text-2xl absolute left-3 top-1/2 transform -translate-y-1/2"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-300"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                      Remember Me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-sm text-[#d97706] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button type="submit" className="w-full py-2 text-white text-md rounded-md bg-[#d97706]">
                  Login
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </form>
            </div>
          </div>
        </div>
        
        {showForgotPasswordModal && (
          <ForgotPasswordModal
            onClose={() => {
              setShowForgotPasswordModal(false);
              setError("");
              setSuccessMessage("");
            }}
            onSubmit={handleForgotPassword}
            error={error}
            successMessage={successMessage}
          />
        )}
        
        {showKeyboard && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 pb-4">
            <div className="animate__animated animate__fadeInUp bg-white p-4 rounded-lg shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {currentInputRef.current?.placeholder || 'Enter Value'}
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
    </>
  );
};

export default Login;