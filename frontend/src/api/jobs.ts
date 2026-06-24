import axios from "axios";
import { authHeaders } from "./auth";
const API = import.meta.env.VITE_API_URL;

export const searchJobs = (params: {
  keyword: string;
  location: string;
  maxHours: number;
  remoteOnly?: boolean;
  excludeAnnotation?: boolean;
  employmentType?: string;
  datePosted?: string;
  experienceLevel?: string;
  publisher?: string;
  page?: number;
}) =>
  axios.get(`${API}/jobs/search`, {
    params: {
      keyword: params.keyword,
      location: params.location,
      max_hours: params.maxHours,
      remote_only: params.remoteOnly ?? false,
      exclude_annotation: params.excludeAnnotation ?? true,
      employment_type: params.employmentType || undefined,
      date_posted: params.datePosted || "today",
      experience_level: params.experienceLevel || "any",
      publisher: params.publisher || undefined,
      page: params.page || 1,
    },
    ...authHeaders()
  });