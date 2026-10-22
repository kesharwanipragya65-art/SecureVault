import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import {
  BarChart3, Activity, Shield, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, KeyRound, RefreshCw, Layers
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);

  const loadAnalytics = () => {
    setLoading(true);
    api.getAnalytics(timeRange)
      .then((data) => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const totalAttempts = (analytics?.successfulLogins || 0) + (analytics?.failedLogins || 0);
  const successRate = totalAttempts > 0 ? Math.round((analytics.successfulLogins / totalAttempts) * 100) : 100;

  return (
    <div className="content-body">
      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Security Analytics
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Authentication success rates, login anomalies, and vault password health
          </p>
        </div>

        {/* Time range selector */}
        <div style={{
          display: "inline-flex",
          background: "#081630",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: "8px",
          padding: "3px"
        }}>
          {[
            { id: "today", label: "24 Hours" },
            { id: "7days", label: "7 Days" },
            { id: "30days", label: "30 Days" },
            { id: "all", label: "All Time" }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                background: timeRange === r.id ? "#2563eb" : "transparent",
                color: timeRange === r.id ? "#ffffff" : "#8ea5c8"
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#8ea5c8" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <div>Computing security metrics...</div>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" }}>
            <div className="cyber-card">
              <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase" }}>
                Authentication Success Rate
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#34d399", marginTop: "8px", lineHeight: 1 }}>
                {successRate}%
              </div>
              <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
                {analytics?.successfulLogins ?? 0} successful of {totalAttempts} attempts
              </div>
            </div>

            <div className="cyber-card">
              <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase" }}>
                Failed Sign-In Attempts
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: (analytics?.failedLogins ?? 0) > 0 ? "#f87171" : "#ffffff", marginTop: "8px", lineHeight: 1 }}>
                {analytics?.failedLogins ?? 0}
              </div>
              <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
                {analytics?.suspiciousEvents ?? 0} flagged as potential anomaly
              </div>
            </div>

            <div className="cyber-card">
              <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase" }}>
                Active Security Alerts
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: (analytics?.activeAlerts ?? 0) > 0 ? "#fbbf24" : "#ffffff", marginTop: "8px", lineHeight: 1 }}>
                {analytics?.activeAlerts ?? 0}
              </div>
              <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
                Monitored across all sessions
              </div>
            </div>

            <div className="cyber-card">
              <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600, textTransform: "uppercase" }}>
                Vault Health Score
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#60a5fa", marginTop: "8px", lineHeight: 1 }}>
                {analytics?.passwordHealthScore ?? 100}<span style={{ fontSize: "18px", color: "#64748b" }}>/100</span>
              </div>
              <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "8px" }}>
                Based on password length & uniqueness
              </div>
            </div>
          </div>

          {/* Password Health Composition */}
          <div className="cyber-card">
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "16px" }}>
              Password Health Composition
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>Strong passwords</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {analytics?.strongPasswords ?? 0}
                </div>
                <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
                  14+ characters, mixed case, numbers & symbols
                </p>
              </div>

              <div style={{ padding: "16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase" }}>Moderate passwords</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {analytics?.mediumPasswords ?? 0}
                </div>
                <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
                  Standard length and complexity
                </p>
              </div>

              <div style={{ padding: "16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#f87171", fontWeight: 700, textTransform: "uppercase" }}>Weak passwords</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {analytics?.weakPasswords ?? 0}
                </div>
                <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
                  Short length or predictable patterns
                </p>
              </div>

              <div style={{ padding: "16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                <span style={{ fontSize: "11px", color: "#c084fc", fontWeight: 700, textTransform: "uppercase" }}>Reused passwords</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {analytics?.reusedPasswords ?? 0}
                </div>
                <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px", margin: 0 }}>
                  Duplicate credentials across sites
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
