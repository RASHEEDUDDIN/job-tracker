import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { userName, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = (path: string) =>
    `text-sm font-medium px-3 py-1.5 rounded transition
    ${location.pathname === path
      ? "bg-blue-100 text-blue-700"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`;

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <span className="font-bold text-blue-600 text-lg">JobTracker</span>
        <div className="flex gap-1">
          <Link to="/search" className={linkClass("/search")}>Find Jobs</Link>
          <Link to="/tracker" className={linkClass("/tracker")}>My Applications</Link>
          <Link to="/stats" className={linkClass("/stats")}>Analytics</Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Hi, {userName}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium">
          Logout
        </button>
      </div>
    </nav>
  );
}