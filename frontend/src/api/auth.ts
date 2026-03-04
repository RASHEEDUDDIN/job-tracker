import axios from "axios";
const API = import.meta.env.VITE_API_URL;

export const register = (name: string, email: string, password: string) =>
  axios.post(`${API}/auth/register`, { name, email, password });

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  localStorage.setItem("token", res.data.access_token);
  localStorage.setItem("user_name", res.data.user_name);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_name");
};

export const getToken = () => localStorage.getItem("token");
export const getUserName = () => localStorage.getItem("user_name");
export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});