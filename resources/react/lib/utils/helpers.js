import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { LIVE_URL } from "../services/api/httpClient";

const baseURL = `${LIVE_URL}/api/v2`;

// Show Toastr function
export const showToast = (message, status, options) => {
  const toastOptions = {
    type: status,
    position: "top-right",
    autoClose: true,
    hideProgressBar: false,
    closeOnClick: false,
    draggable: true,
    pauseOnHover: true,
    newestOnTop: true,
    rtl: false,
    pauseOnFocusLoss: true,
    theme: "light",
    ...options,
  };

  return toast(message, toastOptions);
};

// export const formatDate = (timestamp) => {
//   if (!timestamp) return null;
//   const date = new Date(timestamp);

//   const day = String(date.getUTCDate()).padStart(2, '0');
//   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//   const year = date.getUTCFullYear();

//   // Get hours, minutes, and seconds
//   const hours = String(date.getUTCHours()).padStart(2, '0');
//   const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//   const seconds = String(date.getUTCSeconds()).padStart(2, '0');

//   // Format the date and time
//   return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
// };

export const formatDate = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);

  // Use local time methods (NOT UTC)
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Get hours, minutes, and seconds in local time
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format the date and time (now in Birmingham time)
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

export const getIpAddress = async () => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
};




