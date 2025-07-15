import axios from "axios";

const ErrorCodeMessages = {
  403: "Access Forbidden",
  404: "Resource or page not found",
  500: "Internal Server Error",
};

// Define URLs


export const LIVE_URL = "https://test.eatstekltd.co.uk";

export const createHttpClient = (useLocal = false) => {
  return axios.create({
    baseURL: LIVE_URL ,
  });
};

const httpClient = createHttpClient(true);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const errorMessage =
      status && ErrorCodeMessages[status]
        ? ErrorCodeMessages[status]
        : error.response?.data?.message || error.message || "Unknown error";

    return Promise.reject(errorMessage);
  }
);

export default httpClient;