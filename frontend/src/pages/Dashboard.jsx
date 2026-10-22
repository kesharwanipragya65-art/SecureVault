import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import {
  Shield, Key, AlertTriangle, Laptop, Activity,
  CheckCircle2, ArrowRight, Plus, Sliders, FileText,
  ShieldCheck, RefreshCw, Star, Clock, Lock
} from "lucide-react";

export default function Dashboard({ onOpenAddModal }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.getAnalytics("all").catch(() => null),
      api.getCredentials().catch(() => []),
      api.getAlerts().catch(() => []),
      api.getDevices().catch(() => []),
      api.getLoginHistory().catch(() => [])
    ])
      .then(([analyticsData, credsData, alertsData, devicesData, activityData]) => {
        if (analyticsData) setAnalytics(analyticsData);
        if (Array.isArray(credsData)) setCredentials(credsData);
        if (Array.isArray(alertsData)) setAlerts(alertsData);
        if (Array.isArray(devicesData)) setDevices(devicesData);
        if (Array.isArray(activityData)) setActivity(activityData);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load security overview. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  // Format real event names into user-friendly terminology
  const formatEventName = (evtType) => {
    if (!evtType) return "Security event";
    switch (evtType.toUpperCase()) {
      case "LOGIN_SUCCESS":
      case "LOGIN":
        return "Successful sign-in";
      case "LOGIN_FAILURE":
      case "FAILED_LOGIN":
        return "Failed sign-in";
      case "BLOCKED_LOGIN":
        return "Blocked sign-in";
      case "PASSWORD_CHANGE":
        return "Password updated";
      case "MFA_VERIFIED":
        return "Two-factor verification passed";
      case "CREDENTIAL_ADDED":
        return "Credential stored";
      default:
        return evtType.replace(/_/g, " ").toLowerCase();
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");
  const securityScore = analytics?.passwordHealthScore ?? (credentials.length > 0 ? 80 : 100);

  return (
    <div className="content-body">
      {/* Top Welcome & Heading */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Security Overview
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            {user?.name ? `Welcome back, ${user.name}. ` : ""}Here's your current security overview.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={loadAllDashboardData}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          borderRadius: "10px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span>{error}</span>
          <button onClick={loadAllDashboardData} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }}>
            Try again
          </button>
        </div>
      )}

      {/* 4 Security Overview KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "18px",
        marginBottom: "28px"
      }}>
        {/* Security Score */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Security Score
            </span>
            <span className="badge badge-emerald">
              {activeAlerts.length === 0 ? "Protected" : "Action Needed"}
            </span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", marginTop: "10px", lineHeight: 1 }}>
            {securityScore}<span style={{ fontSize: "18px", color: "#64748b", fontWeight: 500 }}>/100</span>
          </div>
          <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
            {credentials.length === 0 ? "Add credentials to compute score" : "Based on password health & 2FA"}
          </div>
        </div>

        {/* Vault Items */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Vault Items
            </span>
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key size={14} />
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", marginTop: "10px", lineHeight: 1 }}>
            {credentials.length}
          </div>
          <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
            {credentials.length === 0 ? "No credentials stored yet" : "Encrypted under AES-256"}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Security Alerts
            </span>
            <span className={`badge ${activeAlerts.length > 0 ? "badge-rose" : "badge-emerald"}`}>
              {activeAlerts.length > 0 ? "Attention" : "None"}
            </span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: activeAlerts.length > 0 ? "#f87171" : "#ffffff", marginTop: "10px", lineHeight: 1 }}>
            {activeAlerts.length}
          </div>
          <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
            {activeAlerts.length === 0 ? "No active security issues" : "Issues requiring review"}
          </div>
        </div>

        {/* Active Devices */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Devices
            </span>
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Laptop size={14} />
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", marginTop: "10px", lineHeight: 1 }}>
            {devices.length > 0 ? devices.length : 1}
          </div>
          <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
            {devices.length === 0 ? "Current device verified" : "Recognized signed-in devices"}
          </div>
        </div>
      </div>

      {/* Main Grid: Password Health & Security Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Password Health Card */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                Password Health
              </h2>
              <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "2px" }}>
                Audit of password complexity and reuse across your vault
              </p>
            </div>
            <Link to="/tools?tab=health" style={{ fontSize: "12px", color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
              Full Audit →
            </Link>
          </div>

          {credentials.length === 0 ? (
            <div className="empty-state" style={{ padding: "36px 16px" }}>
              <div className="empty-state-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="empty-state-title">No credentials yet</div>
              <div className="empty-state-desc">
                Add your first credential to get started and see password health metrics.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "14px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>Strong passwords</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {analytics?.strongPasswords ?? credentials.filter(c => c.strength === "STRONG").length}
                </div>
                <span style={{ fontSize: "11px", color: "#8ea5c8" }}>Meets security guidelines</span>
              </div>

              <div style={{ padding: "14px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#f87171", fontWeight: 700, textTransform: "uppercase" }}>Weak passwords</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {analytics?.weakPasswords ?? credentials.filter(c => c.strength === "WEAK").length}
                </div>
                <span style={{ fontSize: "11px", color: "#8ea5c8" }}>Needs rotation</span>
              </div>

              <div style={{ padding: "14px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#c084fc", fontWeight: 700, textTransform: "uppercase" }}>Reused passwords</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {analytics?.reusedPasswords ?? 0}
                </div>
                <span style={{ fontSize: "11px", color: "#8ea5c8" }}>Duplicate across sites</span>
              </div>

              <div style={{ padding: "14px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase" }}>Passwords needing review</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {(analytics?.weakPasswords ?? credentials.filter(c => c.strength === "WEAK").length) + (analytics?.reusedPasswords ?? 0)}
                </div>
                <span style={{ fontSize: "11px", color: "#8ea5c8" }}>Action recommended</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Alerts Card */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                Security Alerts
              </h2>
              <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "2px" }}>
                Threat incidents & breach monitoring
              </p>
            </div>
            <Link to="/monitoring" style={{ fontSize: "12px", color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="empty-state" style={{ padding: "36px 16px" }}>
              <div className="empty-state-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="empty-state-title">No security alerts</div>
              <div className="empty-state-desc">
                There are no active security issues requiring your attention.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "12px 14px",
                    background: "#081630",
                    borderLeft: "3px solid #ef4444",
                    borderRadius: "6px",
                    border: "1px solid rgba(239, 68, 68, 0.2)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "#ffffff" }}>{a.title}</span>
                    <span className="badge badge-rose" style={{ fontSize: "10px" }}>{a.severity}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Recent Security Activity & Vault Snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Recent Security Activity */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                Recent Security Activity
              </h2>
              <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "2px" }}>
                Authentication history & access events
              </p>
            </div>
            <Link to="/activity" style={{ fontSize: "12px", color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
              Full Log →
            </Link>
          </div>

          {activity.length === 0 ? (
            <div className="empty-state" style={{ padding: "36px 16px" }}>
              <div className="empty-state-icon">
                <Activity size={22} />
              </div>
              <div className="empty-state-title">No recent activity</div>
              <div className="empty-state-desc">
                Security activity will appear here as you use SecureVault.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activity.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    padding: "10px 14px",
                    background: "#081630",
                    borderRadius: "8px",
                    border: "1px solid rgba(59, 130, 246, 0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff" }}>
                      {formatEventName(evt.eventType)}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8ea5c8", marginTop: "2px" }}>
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"} • {evt.deviceInfo || "Desktop"} {evt.browser ? `• ${evt.browser}` : ""}
                    </div>
                  </div>
                  <span className={`badge ${evt.status === "SUCCESS" ? "badge-emerald" : "badge-rose"}`} style={{ fontSize: "10px" }}>
                    {evt.status === "SUCCESS" ? "Success" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vault Snapshot */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                Vault Snapshot
              </h2>
              <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "2px" }}>
                Preview of stored secure credentials
              </p>
            </div>
            <Link to="/vault" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
              Open Vault <ArrowRight size={13} />
            </Link>
          </div>

          {credentials.length === 0 ? (
            <div className="empty-state" style={{ padding: "36px 16px" }}>
              <div className="empty-state-icon">
                <Lock size={22} />
              </div>
              <div className="empty-state-title">No credentials yet</div>
              <div className="empty-state-desc" style={{ marginBottom: "14px" }}>
                Add your first credential to get started.
              </div>
              {onOpenAddModal && (
                <button onClick={onOpenAddModal} className="btn btn-primary" style={{ padding: "7px 14px", fontSize: "12px" }}>
                  <Plus size={14} /> Add Credential
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {credentials.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "10px 14px",
                    background: "#081630",
                    borderRadius: "8px",
                    border: "1px solid rgba(59, 130, 246, 0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Key size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff" }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#8ea5c8" }}>
                        {c.username || "—"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="badge badge-slate" style={{ fontSize: "10px" }}>
                      {c.category || "General"}
                    </span>
                    {c.favorite && <Star size={13} color="#f59e0b" fill="#f59e0b" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="cyber-card" style={{ padding: "20px 24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "14px" }}>
          Quick Actions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {/* Action 1 */}
          <div
            onClick={onOpenAddModal}
            style={{
              padding: "14px",
              background: "#081630",
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.18)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontWeight: 700, fontSize: "13px" }}>
              <Plus size={16} /> Add Credential
            </div>
            <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
              Save a new password or secure credential.
            </p>
          </div>

          {/* Action 2 */}
          <Link
            to="/tools"
            style={{
              padding: "14px",
              background: "#081630",
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.18)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontWeight: 700, fontSize: "13px" }}>
              <Sliders size={16} /> Generate Password
            </div>
            <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
              Create a strong, unique password.
            </p>
          </Link>

          {/* Action 3 */}
          <Link
            to="/reports"
            style={{
              padding: "14px",
              background: "#081630",
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.18)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontWeight: 700, fontSize: "13px" }}>
              <FileText size={16} /> Export Report
            </div>
            <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
              Download a security report as PDF or Excel.
            </p>
          </Link>

          {/* Action 4 */}
          <Link
            to="/monitoring?tab=devices"
            style={{
              padding: "14px",
              background: "#081630",
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.18)",
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.18)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontWeight: 700, fontSize: "13px" }}>
              <Laptop size={16} /> Manage Devices
            </div>
            <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
              Review and manage signed-in devices.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
