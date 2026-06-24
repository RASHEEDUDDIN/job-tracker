import { useState } from "react";
import { searchJobs } from "../api/jobs";
import { saveJob } from "../api/applications";
import type { JobResult } from "../types";

export default function SearchPage() {
  const [keyword, setKeyword] = useState("Software Developer");
  const [location, setLocation] =  useState("Toronto, Ontario, Canada");
  const [timeFilter, setTimeFilter] = useState("today_24");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [excludeAnnotation, setExcludeAnnotation] = useState(true);
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("any");
  const [selectedPublisher, setSelectedPublisher] = useState("");

  // Derive datePosted + maxHours from unified timeFilter
  const TIME_OPTIONS: Record<string, { datePosted: string; maxHours: number; label: string }> = {
    today_6:   { datePosted: "today", maxHours: 6,   label: "Under 6 hrs" },
    today_12:  { datePosted: "today", maxHours: 12,  label: "Under 12 hrs" },
    today_24:  { datePosted: "today", maxHours: 24,  label: "Under 24 hrs" },
    days_3:    { datePosted: "3days", maxHours: 72,  label: "Last 3 days" },
    week:      { datePosted: "week",  maxHours: 168, label: "Last week" },
    month:     { datePosted: "month", maxHours: 999, label: "Last month" },
  };
  const { datePosted, maxHours } = TIME_OPTIONS[timeFilter];

  const [results, setResults] = useState<JobResult[]>([]);
  const [selected, setSelected] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [recentCount, setRecentCount] = useState(0);
  const [availablePublishers, setAvailablePublishers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleSearch = async (p = 1) => {
    setLoading(true); setError(""); setSelected(null); setPage(p);
    try {
      const res = await searchJobs({
        keyword, location, maxHours,
        remoteOnly, excludeAnnotation,
        employmentType, datePosted,
        experienceLevel,
        publisher: selectedPublisher,
        page: p
      });
      setResults(res.data.jobs);
      setRecentCount(res.data.recent_count);
      setAvailablePublishers(res.data.available_publishers || []);
      // JSearch returns ~10 per page, if we got 10 assume there's more
      setHasMore(res.data.jobs.length >= 10);
    } catch {
      setError("Search failed — check API key or try again");
    }
    setLoading(false);
  };

  const handleSave = async (job: JobResult) => {
    try {
      await saveJob({
        jsearch_job_id: job.id,
        title: job.title,
        company: job.company,
        company_logo: job.company_logo,
        location: job.location,
        job_type: job.job_type,
        job_url: job.apply_link,
        is_remote: job.is_remote,
        description: job.description,
        salary_string: job.salary_string,
        posted_at: job.posted_utc
      });
      setSaved(prev => new Set([...prev, job.id]));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to save");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Find Jobs</h1>
      <p className="text-gray-500 text-sm mb-5">
        Apply early — {TIME_OPTIONS[timeFilter].label.toLowerCase()} jobs get far fewer applicants
      </p>

      {/* Row 1: Keyword + Location + Search */}
      <div className="flex flex-wrap gap-3 mb-3">
        <input className="border rounded px-3 py-2 flex-1 min-w-48"
          placeholder="e.g. Python Developer"
          value={keyword} onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch(1)} />
        <input className="border rounded px-3 py-2 flex-1 min-w-48"
          placeholder="e.g. Toronto, Ontario, Canada"
          value={location} onChange={e => setLocation(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch(1)} />
        <button onClick={() => handleSearch(1)} disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Row 2: Dropdowns */}
      <div className="flex flex-wrap gap-3 mb-3">
        {/* Unified Time Filter */}
        <select className="border rounded px-3 py-2 text-sm"
          value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
          {Object.entries(TIME_OPTIONS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        {/* Employment Type */}
        <select className="border rounded px-3 py-2 text-sm"
          value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
          <option value="">All Types</option>
          <option value="FULLTIME">Full-time</option>
          <option value="PARTTIME">Part-time</option>
          <option value="CONTRACTOR">Contractor</option>
          <option value="INTERN">Intern</option>
        </select>

        {/* Experience Level */}
        <select className="border rounded px-3 py-2 text-sm"
          value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
          <option value="any">All Levels</option>
          <option value="entry">Entry Level / Junior</option>
          <option value="mid">Mid Level</option>
          <option value="senior">Senior / Lead</option>
        </select>

        {/* Publisher — only show after first search */}
        {availablePublishers.length > 0 && (
          <select className="border rounded px-3 py-2 text-sm"
            value={selectedPublisher} onChange={e => setSelectedPublisher(e.target.value)}>
            <option value="">All Sources</option>
            {availablePublishers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Row 3: Toggles */}
      <div className="flex gap-6 mb-5 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={remoteOnly}
            onChange={e => setRemoteOnly(e.target.checked)} />
          Remote only
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={excludeAnnotation}
            onChange={e => setExcludeAnnotation(e.target.checked)} />
          Hide AI annotation jobs
        </label>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Results Summary */}
      {results.length > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          {results.length} results —
          <span className="text-green-600 font-semibold"> {recentCount} posted within {maxHours} hours</span>
          <span className="text-gray-400 text-xs ml-2">
            ⚠️ Apply links may open LinkedIn — some redirect to company site
          </span>
        </p>
      )}

      <div className="flex gap-6">
        {/* Job List */}
        <div className="flex-1 space-y-3">
          {results.map(job => (
            <div key={job.id} onClick={() => setSelected(job)}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition
                ${job.is_recent ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}
                ${selected?.id === job.id ? "ring-2 ring-blue-500" : ""}`}>
              <div className="flex items-start gap-3">
                {job.company_logo
                  ? <img src={job.company_logo} alt={job.company}
                      className="w-10 h-10 rounded object-contain flex-shrink-0" />
                  : <div className="w-10 h-10 rounded bg-gray-200 flex items-center
                      justify-center text-sm font-bold flex-shrink-0">
                      {job.company?.[0]}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{job.title}</h3>
                  <p className="text-gray-600 text-sm">{job.company} · {job.location}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {job.job_type && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{job.job_type}</span>
                    )}
                    {job.is_remote && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Remote</span>
                    )}
                    {job.salary_string && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                        {job.salary_string}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium
                      ${job.is_recent ? "bg-green-100 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                      {job.posted_human || `${job.hours_ago}h ago`}
                    </span>
                    {/* Show publishers as small tags */}
                    {job.apply_options?.slice(0, 2).map((opt, i) => (
                      <span key={i} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded border">
                        {opt.publisher}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Job Detail Panel */}
        {selected && (
          <div className="w-96 border rounded-lg p-5 sticky top-6
            max-h-[85vh] overflow-y-auto flex-shrink-0">
            <div className="flex items-start gap-3 mb-3">
              {selected.company_logo
                ? <img src={selected.company_logo} className="w-12 h-12 rounded" />
                : <div className="w-12 h-12 rounded bg-gray-200 flex items-center
                    justify-center font-bold">{selected.company?.[0]}</div>
              }
              <div>
                <h2 className="text-lg font-bold leading-tight">{selected.title}</h2>
                <p className="text-gray-600 text-sm">{selected.company}</p>
                <p className="text-gray-500 text-xs">{selected.location}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {selected.job_type && (
                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">{selected.job_type}</span>
              )}
              {selected.is_remote && (
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Remote</span>
              )}
              {selected.salary_string && (
                <span className="text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  {selected.salary_string}
                </span>
              )}
              <span className={`text-sm px-2 py-0.5 rounded font-medium
                ${selected.is_recent ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {selected.posted_human}
              </span>
            </div>

            {selected.benefits?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selected.benefits.map((b, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{b}</span>
                ))}
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                {selected.description?.slice(0, 800)}
                {selected.description?.length > 800 ? "..." : ""}
              </p>
            </div>

            <div className="flex gap-2 mb-3">
              <a href={selected.apply_link} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white text-center py-2 rounded text-sm hover:bg-blue-700">
                Apply Now ↗
              </a>
              <button onClick={() => handleSave(selected)}
                disabled={saved.has(selected.id)}
                className="flex-1 border border-blue-600 text-blue-600 py-2 rounded
                  text-sm hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed">
                {saved.has(selected.id) ? "Saved ✓" : "Save to Tracker"}
              </button>
            </div>

            {selected.apply_options?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Apply on:</p>
                <div className="flex flex-wrap gap-2">
                  {selected.apply_options.map((opt, i) => (
                    <a key={i} href={opt.apply_link} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-gray-50 border text-blue-500 px-2 py-1 rounded hover:bg-blue-50">
                      {opt.publisher} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {results.length > 0 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => handleSearch(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-50
              disabled:opacity-40 disabled:cursor-not-allowed">
            ← Prev
          </button>
          <span className="text-sm text-gray-600 px-3">Page {page}</span>
          <button
            onClick={() => handleSearch(page + 1)}
            disabled={!hasMore || loading}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-50
              disabled:opacity-40 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}