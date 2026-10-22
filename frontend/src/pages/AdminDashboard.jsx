import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import {
  Shield, Users, Activity, FileText,
  AlertTriangle, CheckCircle2, Lock, ShieldAlert, RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.adminGetUsers(),
      api.adminGetSystemStats(),
      api.adminGetAuditLogs(),
      api.adminGetSecurityEvents()
    ])
      .then(([usersData, statsData, logsData, eventsData]) => {
        if (Array.isArray(usersData)) setUsers(usersData);
        if (statsData) setStats(statsData);
        if (Array.isArray(logsData)) setAuditLogs(logsData);
        if (Array.isArray(eventsData)) setSecurityEvents(eventsData);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load administrator data. Make sure your account has administrator privileges.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.adminUpdateRole(userId, newRole);
      setMessage("User role updated successfully.");
      loadData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to update role");
    }
  };

  const formatEventName = (raw) => {
    if (!raw) return "Security Event";
    const map = {
      LOGIN_SUCCESS: "Successful sign-in",
      LOGIN_FAILURE: "Failed sign-in attempt",
      CREDENTIAL_ACCESSED: "Credential accessed",
      CREDENTIAL_CREATED: "Credential created",
      CREDENTIAL_UPDATED: "Credential updated",
      CREDENTIAL_DELETED: "Credential deleted",
      PASSWORD_RESET_REQUESTED: "Password reset requested",
      MFA_ENABLED: "Two-factor authentication enabled",
      MFA_DISABLED: "Two-factor authentication disabled"
    };
    return map[raw] || raw.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="content-body">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "20px", padding: "4px 12px", marginBottom: "10px" }}>
            <ShieldAlert size={14} color="#f87171" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Administrator Console
            </span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            Admin Management
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            Manage users, role governance, system audit logs, and global security telemetry.
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn btn-secondary"
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          Refresh Data
        </button>
      </div>

      {message && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          borderRadius: "10px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          borderRadius: "10px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Global Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div className="cyber-card">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Total Users</span>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>
            {stats?.totalUsers ?? 0}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Registered platform accounts</span>
        </div>
        <div className="cyber-card">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Global Credentials</span>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
            {stats?.totalCredentials ?? 0}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Encrypted items secured</span>
        </div>
        <div className="cyber-card">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Sign-In Events</span>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#60a5fa", marginTop: "4px" }}>
            {stats?.totalLoginEvents ?? 0}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Logged authentication attempts</span>
        </div>
        <div className="cyber-card">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Audit Trail Records</span>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
            {stats?.totalAuditLogs ?? 0}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Immutable activity traces</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("users")}
          className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
        >
          <Users size={16} /> User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`btn ${activeTab === "audit" ? "btn-primary" : "btn-secondary"}`}
        >
          <FileText size={16} /> System Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`btn ${activeTab === "events" ? "btn-primary" : "btn-secondary"}`}
        >
          <Activity size={16} /> Global Security Telemetry ({securityEvents.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="cyber-card" style={{ padding: "0" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>User Accounts</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Review registered users and adjust system permissions.
            </p>
          </div>
          {users.length === 0 ? (
            <div className="empty-state">
              <Users size={36} color="var(--text-muted)" />
              <div style={{ fontWeight: 600, marginTop: "12px", color: "var(--text-main)" }}>No users found</div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                There are no user accounts in the database or you do not have permission to view them.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Two-Factor Auth</th>
                    <th>Assigned Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>#{u.id}</td>
                      <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{u.name}</td>
                      <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                      <td>
                        {u.mfaEnabled ? (
                          <span className="badge badge-emerald">Enabled</span>
                        ) : (
                          <span className="badge badge-rose">Disabled</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${u.role === "ROLE_ADMINISTRATOR" ? "badge-rose" : u.role === "ROLE_TEAM_MEMBER" ? "badge-cyan" : "badge-blue"}`}>
                          {u.role === "ROLE_ADMINISTRATOR" ? "Administrator" : u.role === "ROLE_TEAM_MEMBER" ? "Team Member" : "Personal User"}
                        </span>
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="input-field"
                          style={{ padding: "6px 10px", fontSize: "12px", width: "160px" }}
                        >
                          <option value="ROLE_USER">Personal User</option>
                          <option value="ROLE_TEAM_MEMBER">Team Member</option>
                          <option value="ROLE_ADMINISTRATOR">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="cyber-card" style={{ padding: "0" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>System Audit Trail</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Complete record of administrative and sensitive actions performed across the vault.
            </p>
          </div>
          {auditLogs.length === 0 ? (
            <div className="empty-state">
              <FileText size={36} color="var(--text-muted)" />
              <div style={{ fontWeight: 600, marginTop: "12px", color: "var(--text-main)" }}>No audit records found</div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                Audit logs will appear here when administrative or vault actions occur.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Origin IP</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600, color: "#38bdf8" }}>{formatEventName(log.action)}</td>
                      <td>{log.details}</td>
                      <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{log.ipAddress || "-"}</td>
                      <td style={{ color: "var(--text-muted)" }}>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Security Events Tab */}
      {activeTab === "events" && (
        <div className="cyber-card" style={{ padding: "0" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>Global Security Telemetry</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Real-time monitoring of authentication events, access controls, and risk evaluations.
            </p>
          </div>
          {securityEvents.length === 0 ? (
            <div className="empty-state">
              <Activity size={36} color="var(--text-muted)" />
              <div style={{ fontWeight: 600, marginTop: "12px", color: "var(--text-main)" }}>No security events recorded</div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                Authentication telemetry and security events will display here in real time.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Target Account</th>
                    <th>Event Type</th>
                    <th>Status</th>
                    <th>Risk Rating</th>
                    <th>IP Address</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {securityEvents.map((e) => (
                    <tr key={e.id}>
                      <td style={{ color: "var(--text-main)" }}>{e.email}</td>
                      <td style={{ fontWeight: 600 }}>{formatEventName(e.eventType)}</td>
                      <td>
                        <span className={`badge ${e.status === "SUCCESS" ? "badge-emerald" : "badge-rose"}`}>
                          {e.status === "SUCCESS" ? "Success" : "Failure"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${e.riskLevel === "CRITICAL" || e.riskLevel === "HIGH" ? "badge-rose" : e.riskLevel === "MEDIUM" ? "badge-amber" : "badge-cyan"}`}>
                          {e.riskLevel || "Low"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{e.ipAddress || "-"}</td>
                      <td style={{ color: "var(--text-muted)" }}>{new Date(e.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
