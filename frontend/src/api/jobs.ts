import axios from "axios";
import { authHeaders } from "./auth";
const API = import.meta.env.VITE_API_URL;

export const searchJobs = (
  keyword: string,
  location: string,
  maxHours: number,
  remoteOnly: boolean = false,
  excludeAnnotation: boolean = true
) =>
  axios.get(`${API}/jobs/search`, {
    params: {
      keyword,
      location,
      max_hours: maxHours,
      remote_only: remoteOnly,
      exclude_annotation: excludeAnnotation
    },
    ...authHeaders()
  });