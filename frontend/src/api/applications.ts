import axios from "axios";
import { authHeaders } from "./auth";
const API = import.meta.env.VITE_API_URL;

export const getApplications = (status?: string) =>
  axios.get(`${API}/applications`, {
    params: status ? { status } : {},
    ...authHeaders()
  });

export const saveJob = (data: object) =>
  axios.post(`${API}/applications`, data, authHeaders());

export const updateApplication = (id: string, data: object) =>
  axios.patch(`${API}/applications/${id}`, data, authHeaders());

export const deleteApplication = (id: string) =>
  axios.delete(`${API}/applications/${id}`, authHeaders());

export const getStats = () =>
  axios.get(`${API}/stats/summary`, authHeaders());

export const getWeeklyStats = () =>
  axios.get(`${API}/stats/weekly`, authHeaders());

export const getStaleApps = () =>
  axios.get(`${API}/reminders/stale`, authHeaders());