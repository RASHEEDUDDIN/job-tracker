import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import TrackerPage from "./pages/TrackerPage";
import StatsPage from "./pages/StatsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={
        isLoggedIn ? <Navigate to="/search" /> : <LoginPage />
      } />
      <Route path="/register" element={
        isLoggedIn ? <Navigate to="/search" /> : <RegisterPage />
      } />
      <Route path="/search" element={
        <ProtectedRoute><Navbar /><SearchPage /></ProtectedRoute>
      } />
      <Route path="/tracker" element={
        <ProtectedRoute><Navbar /><TrackerPage /></ProtectedRoute>
      } />
      <Route path="/stats" element={
        <ProtectedRoute><Navbar /><StatsPage /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={isLoggedIn ? "/search" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}