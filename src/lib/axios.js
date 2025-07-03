import axios from "axios";

// Set default headers untuk semua request
axios.defaults.headers.common = {
  "Content-Type": "application/json",
};

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    // Pastikan Content-Type selalu application/json untuk POST requests
    if (config.method === "post" || config.method === "put") {
      config.headers["Content-Type"] = "application/json";
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Axios Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    console.error("Axios Request Error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Axios Response Success:", {
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      if (error.response) {
        console.error("Axios Response Error:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          requestData: error.config?.data,
        });
      } else {
        // Network error atau tidak ada response sama sekali
        console.error("Axios Response Error (No Response):", {
          message: error.message,
          url: error.config?.url,
          requestData: error.config?.data,
        });
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
