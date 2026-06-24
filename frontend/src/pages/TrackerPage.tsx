import { useState, useEffect, useCallback } from "react";
import { getApplications, updateApplication, deleteApplication } from "../api/applications";
import type { Application, AppStatus } from "../types";
import { STATUS_COLORS, ALL_STATUSES } from "../types";

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [appliedDate, setAppliedDate] = useState<string>("");

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApplications();
      setApps(res.data);
    } catch {
      console.error("Failed to fetch applications");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleStatusChange = async (id: string, status: AppStatus) => {
    try {
      await updateApplication(id, { status });
      setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      alert("Failed to update status");
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await updateApplication(id, {
        notes,
        applied_date: appliedDate || undefined
      });
      setApps(prev => prev.map(a =>
        a.id === id ? { ...a, notes, applied_date: appliedDate || null } : a
      ));
      setEditingId(null);
    } catch {
      alert("Failed to save notes");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this application?")) return;
    try {
      await deleteApplication(id);
      setApps(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const filtered = filterStatus === "all"
    ? apps
    : apps.filter(a => a.status === filterStatus);

  if (loading) return (
    <div className="p-6 text-center text-gray-500">Loading applications...</div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">My Applications</h1>
      <p className="text-gray-500 text-sm mb-5">{apps.length} total applications tracked</p>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition
            ${filterStatus === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          All ({apps.length})
        </button>
        {ALL_STATUSES.map(s => {
          const count = apps.filter(a => a.status === s).length;
          if (count === 0) return null;
          return (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition
                ${filterStatus === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No applications yet</p>
          <p className="text-sm mt-1">Search for jobs and save them to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {app.company_logo
                    ? <img src={app.company_logo} className="w-10 h-10 rounded object-contain flex-shrink-0" />
                    : <div className="w-10 h-10 rounded bg-gray-200 flex items-center
                        justify-center text-sm font-bold flex-shrink-0">
                        {app.company?.[0]}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{app.title}</h3>
                    <p className="text-gray-600 text-sm">{app.company} · {app.location}</p>
                    {app.salary_string && (
                      <p className="text-purple-600 text-xs mt-0.5">{app.salary_string}</p>
                    )}
                    {app.applied_date && (
                      <p className="text-gray-400 text-xs mt-0.5">Applied: {app.applied_date}</p>
                    )}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={app.status}
                    onChange={e => handleStatusChange(app.id, e.target.value as AppStatus)}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer
                      ${STATUS_COLORS[app.status]}`}>
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setEditingId(editingId === app.id ? null : app.id);
                      setNotes(app.notes || "");
                      setAppliedDate(app.applied_date || "");
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700">
                    Notes
                  </button>
                  {app.job_url && (
                    <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-gray-600">
                      View ↗
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-xs text-red-400 hover:text-red-600">
                    ✕
                  </button>
                </div>
              </div>

              {/* Notes Editor */}
              {editingId === app.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Applied date</label>
                    <input type="date" value={appliedDate}
                      onChange={e => setAppliedDate(e.target.value)}
                      className="mt-1 block border rounded px-2 py-1 text-sm w-48" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      rows={3} placeholder="Interview notes, contacts, follow-up reminders..."
                      className="mt-1 w-full border rounded px-2 py-1 text-sm resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveNotes(app.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {app.notes && editingId !== app.id && (
                <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {app.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}