import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import {
  Laptop, Smartphone, CheckCircle2, XCircle, ShieldCheck,
  RefreshCw, AlertTriangle, Monitor
} from "lucide-react";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDevices = () => {
    setLoading(true);
    api.getDevices()
      .then((data) => {
        if (Array.isArray(data)) {
          setDevices(data);
          setError("");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load authenticated devices.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleTrustDevice = async (id) => {
    try {
      await api.trustDevice(id);
      setMessage("Device verified and marked as trusted.");
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, trusted: true } : d))
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Failed to trust device: " + (e.message || "Unknown error"));
    }
  };

  const handleRevokeDevice = async (id, deviceName) => {
    if (!window.confirm(`Revoke session for "${deviceName || "this device"}"? Any active login from this device will be signed out.`)) return;
    try {
      await api.revokeDevice(id);
      setMessage("Device session terminated and access revoked.");
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, revoked: true, trusted: false } : d))
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Failed to revoke device: " + (e.message || "Unknown error"));
    }
  };

  const total = devices.length;
  const trusted = devices.filter((d) => d.trusted && !d.revoked).length;
  const unverified = devices.filter((d) => !d.trusted && !d.revoked).length;
  const revoked = devices.filter((d) => d.revoked).length;

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
            Devices & Active Sessions
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Review hardware profiles, manage trusted workstations, and revoke unauthorized sessions
          </p>
        </div>

        <button
          onClick={loadDevices}
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

      {/* Metrics Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Total Devices</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>{total}</div>
        </div>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Trusted Devices</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>{trusted}</div>
        </div>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Unverified Devices</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: unverified > 0 ? "#fbbf24" : "#ffffff", marginTop: "4px" }}>{unverified}</div>
        </div>
        <div className="cyber-card">
          <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Revoked Sessions</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: revoked > 0 ? "#f87171" : "#ffffff", marginTop: "4px" }}>{revoked}</div>
        </div>
      </div>

      {/* Device Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#8ea5c8" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <div>Scanning connected devices...</div>
        </div>
      ) : devices.length === 0 ? (
        <div className="cyber-card empty-state">
          <div className="empty-state-icon">
            <Monitor size={26} />
          </div>
          <div className="empty-state-title">No devices registered</div>
          <div className="empty-state-desc">
            Hardware workstations, tablets, and browsers used to access SecureVault will appear here.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {devices.map((d) => (
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

                <div style={{
                  fontSize: "12px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "6px",
                  background: "#081630", padding: "10px 12px", borderRadius: "8px",
                  border: "1px solid rgba(59, 130, 246, 0.12)"
                }}>
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
                    style={{ padding: "5px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <CheckCircle2 size={13} color="#34d399" /> Trust Device
                  </button>
                )}
                {!d.revoked && (
                  <button
                    onClick={() => handleRevokeDevice(d.id, d.deviceName)}
                    className="btn btn-danger"
                    style={{ padding: "5px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <XCircle size={13} /> Revoke Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
