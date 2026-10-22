import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import {
  Shield, AlertTriangle, Laptop, Activity, CheckCircle2,
  XCircle, Smartphone, RefreshCw, Check, ShieldCheck,
  TrendingUp, Award, AlertCircle
} from "lucide-react";

export default function SecurityMonitoring() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [logins, setLogins] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.getAlerts().catch(() => []),
      api.getDevices().catch(() => []),
      api.getLoginHistory().catch(() => []),
      api.getAnalytics("all").catch(() => null)
    ])
      .then(([alertsData, devicesData, loginsData, analyticsData]) => {
        if (Array.isArray(alertsData)) setAlerts(alertsData);
        if (Array.isArray(devicesData)) setDevices(devicesData);
        if (Array.isArray(loginsData)) setLogins(loginsData);
        if (analyticsData) setAnalytics(analyticsData);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load security center data. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleResolveAlert = async (id) => {
    try {
      await api.resolveAlert(id);
      setMessage("Security alert marked as resolved");
      loadAll();
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Failed to resolve alert: " + (e.message || "Unknown error"));
    }
  };

  const handleTrustDevice = async (id) => {
    try {
      await api.trustDevice(id);
      setMessage("Device verified and marked as trusted");
      loadAll();
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Failed to trust device: " + (e.message || "Unknown error"));
    }
  };

  const handleRevokeDevice = async (id) => {
    if (!window.confirm("Remove this device? Any active session from this device will be signed out.")) return;
    try {
      await api.revokeDevice(id);
      setMessage("Device removed and access revoked");
      loadAll();
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Failed to remove device: " + (e.message || "Unknown error"));
    }
  };

  const formatEventStatus = (status) => {
    if (!status) return "Recorded";
    if (status === "SUCCESS") return "Successful sign-in";
    if (status === "BLOCKED") return "Blocked sign-in";
    return "Failed sign-in";
  };

  const getSeverityBadge = (s) => {
    switch (s?.toUpperCase()) {
      case "CRITICAL":
      case "HIGH":
        return <span className="badge badge-rose">{s?.toUpperCase()}</span>;
      case "MEDIUM":
        return <span className="badge badge-amber">MEDIUM</span>;
      default:
        return <span className="badge badge-blue">LOW</span>;
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");
  const failedLogins = logins.filter((l) => l.status !== "SUCCESS");
  const securityScore = analytics?.passwordHealthScore ?? 100;
  const riskLevel = activeAlerts.length > 0 || failedLogins.length > 3 ? "Elevated" : "Low";

  return (
    <div className="content-body">
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Security Center
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Review security alerts, manage authorized devices, and inspect login history.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="btn btn-secondary"
          style={{ fontSize: "12px", padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {message && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "13px"
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "13px"
        }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid rgba(59, 130, 246, 0.15)", paddingBottom: "12px", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("overview")}
          className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <Shield size={14} /> Security Score & Risk
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`btn ${activeTab === "alerts" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <AlertTriangle size={14} /> Security Alerts ({activeAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab("suspicious")}
          className={`btn ${activeTab === "suspicious" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <AlertCircle size={14} /> Suspicious Activity ({failedLogins.length})
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`btn ${activeTab === "activity" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <Activity size={14} /> Login Activity ({logins.length})
        </button>

        <button
          onClick={() => setActiveTab("devices")}
          className={`btn ${activeTab === "devices" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <Laptop size={14} /> Devices ({devices.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#8ea5c8" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <div>Synchronizing security data...</div>
        </div>
      ) : (
        <>
          {/* Security Score, Risk Level & Recommendations */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {/* Security Score */}
                <div className="cyber-card">
                  <span style={{ fontSize: "12px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Security Score
                  </span>
                  <div style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff", marginTop: "8px", lineHeight: 1 }}>
                    {securityScore}<span style={{ fontSize: "18px", color: "#64748b" }}>/100</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px", margin: 0 }}>
                    Computed from password complexity, active alerts, and two-factor authentication.
                  </p>
                </div>

                {/* Risk Level */}
                <div className="cyber-card">
                  <span style={{ fontSize: "12px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Risk Level
                  </span>
                  <div style={{ fontSize: "36px", fontWeight: 800, color: riskLevel === "Low" ? "#34d399" : "#fbbf24", marginTop: "8px", lineHeight: 1 }}>
                    {riskLevel}
                  </div>
                  <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px", margin: 0 }}>
                    {riskLevel === "Low" ? "No anomalous patterns or critical threats detected." : "Review alerts and unrecognized devices below."}
                  </p>
                </div>

                {/* Active Alerts Count */}
                <div className="cyber-card">
                  <span style={{ fontSize: "12px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Active Alerts
                  </span>
                  <div style={{ fontSize: "36px", fontWeight: 800, color: activeAlerts.length > 0 ? "#f87171" : "#ffffff", marginTop: "8px", lineHeight: 1 }}>
                    {activeAlerts.length}
                  </div>
                  <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px", margin: 0 }}>
                    {activeAlerts.length === 0 ? "All clear. Zero pending threats." : "Requires security review."}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="cyber-card">
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "14px" }}>
                  Recommendations
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ padding: "12px 16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <ShieldCheck size={20} color="#34d399" />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>Two-factor authentication</div>
                      <div style={{ fontSize: "12px", color: "#8ea5c8" }}>Enable 2FA in Settings for authenticator app passcodes on every sign-in.</div>
                    </div>
                  </div>

                  <div style={{ padding: "12px 16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <CheckCircle2 size={20} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>Rotate weak and reused passwords</div>
                      <div style={{ fontSize: "12px", color: "#8ea5c8" }}>Check Password Health in Password Tools to replace at-risk credentials.</div>
                    </div>
                  </div>

                  <div style={{ padding: "12px 16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Laptop size={20} color="#a78bfa" />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>Manage recognized devices</div>
                      <div style={{ fontSize: "12px", color: "#8ea5c8" }}>Review signed-in browsers and hardware under the Devices tab.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Alerts Tab */}
          {activeTab === "alerts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {activeAlerts.length === 0 ? (
                <div className="cyber-card empty-state">
                  <div className="empty-state-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                    <CheckCircle2 size={26} />
                  </div>
                  <div className="empty-state-title">No security alerts</div>
                  <div className="empty-state-desc">
                    There are no active security issues requiring your attention.
                  </div>
                </div>
              ) : (
                activeAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="cyber-card"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                      borderLeft: "4px solid #ef4444"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        {getSeverityBadge(a.severity)}
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                          {a.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
                        {a.description}
                      </p>
                      <span style={{ fontSize: "11px", color: "#8ea5c8", marginTop: "4px", display: "block" }}>
                        Detected: {a.createdAt ? new Date(a.createdAt).toLocaleString() : "Recently"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResolveAlert(a.id)}
                      className="btn btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Check size={14} color="#34d399" /> Resolve Alert
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Suspicious Activity Tab */}
          {activeTab === "suspicious" && (
            <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
              {failedLogins.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}>
                    <CheckCircle2 size={26} />
                  </div>
                  <div className="empty-state-title">No suspicious activity detected</div>
                  <div className="empty-state-desc">
                    Failed sign-ins, IP anomalies, and blocked access attempts will display here.
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="cyber-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Event Type</th>
                        <th>Device & Browser</th>
                        <th>IP Address</th>
                        <th>Risk Assessment</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failedLogins.map((evt) => (
                        <tr key={evt.id}>
                          <td>
                            <span className="badge badge-rose">
                              {formatEventStatus(evt.status)}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: "#ffffff" }}>
                            {evt.eventType || "Sign-in"}
                          </td>
                          <td>
                            {evt.deviceInfo || "Desktop"} {evt.browser ? `• ${evt.browser}` : ""}
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                            {evt.ipAddress || "—"}
                          </td>
                          <td>
                            {getSeverityBadge(evt.riskLevel)}
                          </td>
                          <td style={{ color: "#8ea5c8", fontSize: "12px" }}>
                            {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Login Activity Tab */}
          {activeTab === "activity" && (
            <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
              {logins.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Activity size={24} />
                  </div>
                  <div className="empty-state-title">No recent activity</div>
                  <div className="empty-state-desc">
                    Security activity will appear here as you use SecureVault.
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="cyber-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Event Type</th>
                        <th>Device & Browser</th>
                        <th>IP Address</th>
                        <th>Risk Assessment</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logins.map((evt) => (
                        <tr key={evt.id}>
                          <td>
                            <span className={`badge ${evt.status === "SUCCESS" ? "badge-emerald" : "badge-rose"}`}>
                              {formatEventStatus(evt.status)}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: "#ffffff" }}>
                            {evt.eventType || "Sign-in"}
                          </td>
                          <td>
                            {evt.deviceInfo || "Desktop"} {evt.browser ? `• ${evt.browser}` : ""}
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                            {evt.ipAddress || "—"}
                          </td>
                          <td>
                            {getSeverityBadge(evt.riskLevel)}
                          </td>
                          <td style={{ color: "#8ea5c8", fontSize: "12px" }}>
                            {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === "devices" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
              {devices.length === 0 ? (
                <div className="cyber-card empty-state" style={{ gridColumn: "1 / -1" }}>
                  <div className="empty-state-icon">
                    <Laptop size={26} />
                  </div>
                  <div className="empty-state-title">No registered devices</div>
                  <div className="empty-state-desc">
                    Hardware devices and browsers you sign in from will be logged here.
                  </div>
                </div>
              ) : (
                devices.map((d) => (
                  <div key={d.id} className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "38px", height: "38px", borderRadius: "8px",
                            background: "rgba(37, 99, 235, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa"
                          }}>
                            {d.deviceType === "Mobile" ? <Smartphone size={18} /> : <Laptop size={18} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>
                              {d.deviceName || "Desktop Workstation"}
                            </div>
                            <span style={{ fontSize: "11px", color: "#8ea5c8" }}>
                              {d.deviceType || "Browser session"}
                            </span>
                          </div>
                        </div>

                        {d.revoked ? (
                          <span className="badge badge-rose">Revoked</span>
                        ) : d.trusted ? (
                          <span className="badge badge-emerald">Trusted</span>
                        ) : (
                          <span className="badge badge-amber">Unverified</span>
                        )}
                      </div>

                      <div style={{ fontSize: "12px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "6px", background: "#081630", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#8ea5c8" }}>Device:</span>
                          <span>{d.deviceName || "Desktop"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#8ea5c8" }}>Browser:</span>
                          <span>{d.browser || "Google Chrome"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#8ea5c8" }}>Operating System:</span>
                          <span>{d.operatingSystem || "Windows"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#8ea5c8" }}>IP Address:</span>
                          <span style={{ fontFamily: "var(--font-mono)" }}>{d.ipAddress || "127.0.0.1"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#8ea5c8" }}>Last Active:</span>
                          <span>{d.lastActive ? new Date(d.lastActive).toLocaleString() : "Active now"}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid rgba(59, 130, 246, 0.12)", paddingTop: "12px", marginTop: "14px" }}>
                      {!d.trusted && !d.revoked && (
                        <button
                          onClick={() => handleTrustDevice(d.id)}
                          className="btn btn-secondary"
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                        >
                          <CheckCircle2 size={13} color="#34d399" /> Trust
                        </button>
                      )}
                      {!d.revoked && (
                        <button
                          onClick={() => handleRevokeDevice(d.id)}
                          className="btn btn-danger"
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                        >
                          <XCircle size={13} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
