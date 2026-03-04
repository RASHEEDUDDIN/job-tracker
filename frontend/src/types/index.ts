export interface JobResult {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  job_type: string;
  is_remote: boolean;
  apply_link: string;
  apply_options: { publisher: string; apply_link: string }[];
  description: string;
  posted_human: string;
  posted_utc: string;
  hours_ago: number;
  salary_string: string | null;
  benefits: string[];
  is_recent: boolean;
}

export interface Application {
  id: string;
  jsearch_job_id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  job_url: string;
  is_remote: boolean;
  status: AppStatus;
  notes: string | null;
  applied_date: string | null;
  salary_string: string | null;
  last_updated: string;
  created_at: string;
}

export type AppStatus =
  | "saved" | "applied" | "interviewing"
  | "assessment" | "offer" | "rejected" | "withdrawn";

export const STATUS_COLORS: Record<AppStatus, string> = {
  saved:        "bg-gray-100 text-gray-700",
  applied:      "bg-blue-100 text-blue-700",
  interviewing: "bg-yellow-100 text-yellow-800",
  assessment:   "bg-purple-100 text-purple-700",
  offer:        "bg-green-100 text-green-700",
  rejected:     "bg-red-100 text-red-700",
  withdrawn:    "bg-gray-100 text-gray-400",
};

export const ALL_STATUSES: AppStatus[] = [
  "saved","applied","interviewing","assessment","offer","rejected","withdrawn"
];