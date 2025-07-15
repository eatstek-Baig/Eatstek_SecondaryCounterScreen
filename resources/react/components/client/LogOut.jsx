import React from 'react';
import { productApi } from '../../lib/services';
import { useNavigate } from 'react-router-dom';

const LogOut = () => {

    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            const response = await productApi.logOutEmploye();

            if (response.status === 200) {
                console.log("Logout Successful");
            } else {
                console.warn("Unexpected Response During logout:", response);
            }
        } catch (err) {
            console.error("Error During logout:", err);

            if (err.response) {
                if (err.response.status === 401) {
                    console.warn("Token Expired or invalid. Clearing Storage.");
                } else if (err.response.status === 500) {
                    alert("Server Error! Try Again later.");
                    return;
                }
            }
        }

        localStorage.removeItem("EmployeId");
        localStorage.removeItem("Token");
        localStorage.removeItem("Screens_Data");
        localStorage.removeItem("Is_user_allowed_to_access_till_dashboard");
        navigate("/login");
    };

    return (
        <>
            <form onSubmit={handleLogout}>
                <div className="flex items-center px-4 py-3 rounded-full h-12 bg-[#d97706] text-gray-100 shadow-md">
                    <div className="flex-grow">
                        <button
                            type="submit"
                            className="text-md font-semibold"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

export default LogOut;
