import axios from "axios";

/* Create axios instance */
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api", // your backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

/* Auto attach token to requests */
axiosClient.interceptors.request.use((config) => {
  const user = localStorage.getItem("electro_user");
  const admin = localStorage.getItem("electro_admin");

  let token = null;

  if (user) token = JSON.parse(user).token;
  if (admin) token = JSON.parse(admin).token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* Global error handler */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
);

export default axiosClient;
