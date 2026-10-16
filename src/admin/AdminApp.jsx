import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminLogin from "./AdminLogin";
import AdminRegister from "./AdminRegister";
import AdminForgot from "./AdminForgot";
import AdminDashboard from "./AdminDashboard";
import CateringAdmin from "./catering/CateringAdmin";
import DecorAdmin from "./decor/DecorAdmin";
import EventAdmin from "./event/EventAdmin";
import ProfileAdmin from "./ProfileAdmin";
import { setLoggedIn } from "./store";
import { clearAuthTokens, getAccessToken, getSavedUsername, login as authenticate, logout as endSession } from "../services/authService";
import UsersAdmin from "./UsersAdmin";
import "./admin.css";
import { Construction } from "lucide-react";

function Soon({ title, text }) {
  return (
    <div className="adm-card">
      <div className="adm-soon">
        <div className="big"><Construction size={42} strokeWidth={1.7} /></div>
        <h2>{title}</h2><p>{text}</p>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const nav = useNavigate();
  const [user, setUser] = useState(() =>
    getAccessToken() ? { username: getSavedUsername() || "admin" } : null
  );
  const [authNotice, setAuthNotice] = useState("");
  const login = async (credentials) => {
    await authenticate(credentials);
    setLoggedIn(true);
    setAuthNotice("");
    setUser({ username: credentials.username });
  };
  const logout = async () => {
    let notice = "";
    try {
      await endSession();
    } catch (error) {
      notice = `Signed out locally, but the server logout failed: ${error.message}`;
    } finally {
      clearAuthTokens();
      setLoggedIn(false);
      setUser(null);
      setAuthNotice(notice);
      nav("/admin/login", { replace: true });
    }
  };

  if (!user) return (
    <Routes>
      <Route path="login" element={<AdminLogin onLogin={login} notice={authNotice} />} />
      <Route path="forgot" element={<AdminForgot />} />
      <Route path="register" element={<AdminRegister />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={logout} user={user} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="catering" element={<CateringAdmin />} />
        <Route path="decor" element={<DecorAdmin />} />
        <Route path="event" element={<EventAdmin />} />
        <Route path="profile" element={<ProfileAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="login" element={<Navigate to="/admin/dashboard" replace />} />
        {/* <Route path="enquiries" element={<Soon title="Enquiries" text="Connect this page to your enquiry API." />} />
        <Route path="settings" element={<Soon title="Settings" text="Workspace preferences go here." />} /> */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}