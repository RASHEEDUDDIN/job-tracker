import { useState, useEffect } from "react";
import { getStats, getWeeklyStats, getStaleApps } from "../api/applications";
import type { AppStatus } from "../types";
import { STATUS_COLORS } from "../types";

interface Summary {
  total_saved: number;
  total_applied: number;
  response_rate: string;
  offer_rate: string;
  by_status: Record<string, number>;
}

interface WeeklyEntry {
  week: string;
  count: number;
}

interface StaleApp {
  id: string;
  company: string;
  role: string;
  days_since_update: number;
}

export default function StatsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [weekly, setWeekly] = useState<WeeklyEntry[]>([]);
  const [stale, setStale] = useState<StaleApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [s, w, st] = await Promise.all([
          getStats(),
          getWeeklyStats(),
          getStaleApps()
        ]);
        setSummary(s.data);
        setWeekly(w.data);
        setStale(st.data.applications);
      } catch {
        console.error("Failed to fetch stats");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="p-6 text-center text-gray-500">Loading stats...</div>
  );

  if (!summary || summary.total_saved === 0) return (
    <div className="p-6 text-center text-gray-400">
      <p className="text-lg">No data yet</p>
      <p className="text-sm mt-1">Save and track applications to see your stats</p>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-gray-500 text-sm mb-6">Your job search pipeline at a glance</p>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{summary.total_saved}</p>
          <p className="text-sm text-gray-500 mt-1">Total Saved</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{summary.total_applied}</p>
          <p className="text-sm text-gray-500 mt-1">Applied</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{summary.response_rate}</p>
          <p className="text-sm text-gray-500 mt-1">Response Rate</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{summary.offer_rate}</p>
          <p className="text-sm text-gray-500 mt-1">Offer Rate</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white border rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-4">Status Breakdown</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary.by_status).map(([status, count]) => (
            <div key={status}
              className={`px-3 py-1.5 rounded-full text-sm font-medium
                ${STATUS_COLORS[status as AppStatus] || "bg-gray-100 text-gray-700"}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}: {count as number}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      {weekly.length > 0 && (
        <div className="bg-white border rounded-lg p-5 mb-6">
          <h2 className="font-semibold mb-4">Weekly Activity</h2>
          <div className="space-y-2">
            {weekly.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24">{w.week}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min((w.count / Math.max(...weekly.map((x: WeeklyEntry) => x.count))) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-6 text-right">{w.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stale Applications */}
      {stale.length > 0 && (
        <div className="bg-white border border-yellow-200 rounded-lg p-5">
          <h2 className="font-semibold mb-1 text-yellow-700">
            ⚠️ Stale Applications ({stale.length})
          </h2>
          <p className="text-xs text-gray-500 mb-4">No updates in 7+ days — consider following up</p>
          <div className="space-y-2">
            {stale.map((a: StaleApp) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{a.company}</span>
                <span className="text-gray-500">{a.role}</span>
                <span className="text-yellow-600 text-xs">{a.days_since_update} days ago</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}