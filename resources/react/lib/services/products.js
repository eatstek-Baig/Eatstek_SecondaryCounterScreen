import httpClient from "./api/httpClient";
import { createHttpClient } from "./api/httpClient";

const localClient = createHttpClient(true);
const liveClient = createHttpClient(false);

// const ipClient = createHttpClient(true);
function ProductService() {
  return {
    getOrdersList: (values) => {
      return httpClient.get(`/api/order-screen`);
    },
    getBranchDetails: () => {
      return httpClient.get("/api/branches");
    },
    allCatelogs: (isLive = true) => {
      const client = isLive ? liveClient : localClient;
      return client.get("/api/get-catalog");
    },
    getPendingCompleteOrders: () => {
      return httpClient.get("/api/get-pending-complete-orders");
    },
    finalizeOrder: (values) => {
      return httpClient.post(`/api/finalizeOrder`, values);
    },
    updateOrderStatus: (values) => {
      return httpClient.post(`/api/update-order-status`, values);
    },
    OrderStatusChange: (values) => {
      return httpClient.post(`/api/change-order-status`, values);
    },

    addReconciliationData: (values) => {
      return httpClient.post(`/api/reconciliations`, values);
    },


    getDelieverOrders: () => {
      return httpClient.get(`/api/get-hubrise-orders`);

    },
    updateHubriseOrderStatus: (values) => {
      return httpClient.patch(`/api/update-hubrise-order-status`, values);
    },
    loginEmploye: (email, password) => {
      return httpClient.get(
        `/api/login-employee?email=${email}&password=${password}`
      );
    },
    logOutEmploye: () => {
      const token = localStorage.getItem("Token");
      return httpClient.post(
        `/api/employee-logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    revertOrderStatus: (values) => {
      const token = localStorage.getItem("Token");
      return httpClient.post(`api/revert-order-into-kitchen`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    cancelOrder: (values) => {
      const token = localStorage.getItem("Token");
      return httpClient.post(`/api/cancel-order`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    checkScreenAuthentication: (values) => {
      return httpClient.post(`/api/authenticate-screen`, values);
    },
    checkTillStats: () => {
      const token = localStorage.getItem("Token");
      return httpClient.get(`/api/till/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    checkTillStart: (values) => {
      const token = localStorage.getItem("Token");
      return httpClient.post(`/api/till/start`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    checkTillClose: (values) => {
      const token = localStorage.getItem("Token");
      return httpClient.post(`/api/till/close`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },


    forgotPassword(values) {
      return httpClient.post(`/api/emp-forgot-password`, values);
    },


    checkTillTabPermission: () => {
      const token = localStorage.getItem("Token");
      return httpClient.get(`/api/permission/check/till`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    checkFinanceTabPermission: () => {
      const token = localStorage.getItem("Token");
      return httpClient.get(`/api/permission/check/finance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },


    checkCurrentStats: () => {
      return httpClient.get(`/api/till/currentStats`);
    },
    // getDeviceConnection: (username, password) => {
    //   return ipClient.get(`/api/v2/device.json`, {
    //     auth: {
    //       username: username,
    //       password: password,
    //     },
    //   });
    // },
  };
}

export default ProductService();
