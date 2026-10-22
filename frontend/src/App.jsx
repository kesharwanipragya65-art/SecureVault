import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import CredentialModal from "./components/CredentialModal";
import { api } from "./api/client";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Vault from "./pages/Vault";
import PasswordTools from "./pages/PasswordTools";
import PasswordHealth from "./pages/PasswordHealth";
import SharedVault from "./pages/SharedVault";
import TeamVault from "./pages/TeamVault";
import SecurityMonitoring from "./pages/SecurityMonitoring";
import LoginActivity from "./pages/LoginActivity";
import DevicesPage from "./pages/DevicesPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedLayout({ children, title }) {
  const { isAuthenticated, loading, token, user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading || (token && !user)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#071328", color: "#38bdf8", fontFamily: "var(--font-main)" }}>
        Loading SecureVault...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleCreateCredential = async (data) => {
    try {
      await api.addCredential(data);
      setModalOpen(false);
      window.dispatchEvent(new CustomEvent("vault:reload"));
    } catch (e) {
      alert(e.message || "Failed to create credential");
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} onOpenAddModal={() => setModalOpen(true)} />
        {children}
      </div>

      <CredentialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateCredential}
      />
    </div>
  );
}

function AdminRoute({ children, title }) {
  const { role } = useAuth();
  if (role !== "ROLE_ADMINISTRATOR") {
    return <Navigate to="/dashboard" replace />;
  }
  return <ProtectedLayout title={title}>{children}</ProtectedLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User Vault & Security Overview */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout title="Security Overview">
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/vault"
            element={
              <ProtectedLayout title="Your Vault">
                <Vault />
              </ProtectedLayout>
            }
          />

          {/* Password Tools & Generator */}
          <Route
            path="/tools"
            element={
              <ProtectedLayout title="Password Generator">
                <PasswordTools />
              </ProtectedLayout>
            }
          />
          <Route
            path="/password-generator"
            element={
              <ProtectedLayout title="Password Generator">
                <PasswordTools />
              </ProtectedLayout>
            }
          />

          {/* Dedicated Password Health Audit */}
          <Route
            path="/password-health"
            element={
              <ProtectedLayout title="Password Health Audit">
                <PasswordHealth />
              </ProtectedLayout>
            }
          />

          {/* Shared Credentials */}
          <Route
            path="/shared"
            element={
              <ProtectedLayout title="Shared Credentials">
                <SharedVault />
              </ProtectedLayout>
            }
          />
          <Route
            path="/shared-credentials"
            element={
              <ProtectedLayout title="Shared Credentials">
                <SharedVault />
              </ProtectedLayout>
            }
          />

          {/* Teams */}
          <Route
            path="/teams"
            element={
              <ProtectedLayout title="Team Groups">
                <TeamVault />
              </ProtectedLayout>
            }
          />

          {/* Security Center & Monitoring */}
          <Route
            path="/monitoring"
            element={
              <ProtectedLayout title="Security Center">
                <SecurityMonitoring />
              </ProtectedLayout>
            }
          />
          <Route
            path="/security-center"
            element={
              <ProtectedLayout title="Security Center">
                <SecurityMonitoring />
              </ProtectedLayout>
            }
          />

          {/* Dedicated Login Activity */}
          <Route
            path="/login-activity"
            element={
              <ProtectedLayout title="Login Activity">
                <LoginActivity />
              </ProtectedLayout>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedLayout title="Login Activity">
                <LoginActivity />
              </ProtectedLayout>
            }
          />

          {/* Dedicated Devices */}
          <Route
            path="/devices"
            element={
              <ProtectedLayout title="Devices">
                <DevicesPage />
              </ProtectedLayout>
            }
          />

          {/* Analytics & Reports */}
          <Route
            path="/analytics"
            element={
              <ProtectedLayout title="Security Analytics">
                <AnalyticsDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedLayout title="Reports">
                <ReportsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout title="Settings">
                <SettingsPage />
              </ProtectedLayout>
            }
          />

          {/* Administrator Console */}
          <Route
            path="/admin"
            element={
              <AdminRoute title="Administrator Console">
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
