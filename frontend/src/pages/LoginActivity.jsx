import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {
  Activity, CheckCircle2, XCircle, ShieldAlert,
  RefreshCw, Laptop, Smartphone, Globe, Filter
} from "lucide-react";

export default function LoginActivity() {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | SUCCESS | FAILED | BLOCKED

  const loadLogins = () => {
    setLoading(true);
    api.getLoginHistory()
      .then((data) => {
        if (Array.isArray(data)) {
          setLogins(data);
          setError("");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load login activity history.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogins();
  }, []);

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

  // Metrics
  const total = logins.length;
  const successful = logins.filter((l) => l.status === "SUCCESS").length;
  const failed = logins.filter((l) => l.status === "FAILURE" || l.status === "FAILED").length;
  const blocked = logins.filter((l) => l.status === "BLOCKED").length;

  const filteredLogins = logins.filter((l) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "SUCCESS") return l.status === "SUCCESS";
    if (statusFilter === "FAILED") return l.status === "FAILURE" || l.status === "FAILED";
    if (statusFilter === "BLOCKED") return l.status === "BLOCKED";
    return true;
  });

  return (
    <div className="content-body">
      {/* Page Header */}
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
            Login Activity
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Audit trail of authentication attempts, IP origins, and session device profiles
          </p>
        </div>

        <button
          onClick={loadLogins}
          className="btn btn-secondary"
          style={{ fontSize: "12px", padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

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

      {/* Metrics Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Total Attempts</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>{total}</div>
        </div>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Successful</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>{successful}</div>
        </div>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Failed Attempts</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: failed > 0 ? "#f87171" : "#ffffff", marginTop: "4px" }}>{failed}</div>
        </div>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Blocked Attempts</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: blocked > 0 ? "#fbbf24" : "#ffffff", marginTop: "4px" }}>{blocked}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid rgba(59, 130, 246, 0.15)", paddingBottom: "12px" }}>
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`btn ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          All Activity ({total})
        </button>
        <button
          onClick={() => setStatusFilter("SUCCESS")}
          className={`btn ${statusFilter === "SUCCESS" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Successful ({successful})
        </button>
        <button
          onClick={() => setStatusFilter("FAILED")}
          className={`btn ${statusFilter === "FAILED" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Failed ({failed})
        </button>
        <button
          onClick={() => setStatusFilter("BLOCKED")}
          className={`btn ${statusFilter === "BLOCKED" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Blocked ({blocked})
        </button>
      </div>

      {/* Activity Table */}
      <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#8ea5c8" }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
            <div>Loading login history...</div>
          </div>
        ) : filteredLogins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Activity size={24} />
            </div>
            <div className="empty-state-title">No login records found</div>
            <div className="empty-state-desc">
              Authentication logs matching this filter will appear here.
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
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogins.map((evt) => (
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
                      {evt.deviceInfo || "Desktop Workstation"} {evt.browser ? `• ${evt.browser}` : ""}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {evt.ipAddress || "127.0.0.1"}
                    </td>
                    <td>
                      {getSeverityBadge(evt.riskLevel)}
                    </td>
                    <td style={{ color: "#8ea5c8", fontSize: "12px" }}>
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "Recently"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
