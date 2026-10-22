import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Shield, Key, Lock, Users, Activity, AlertTriangle,
  FileText, Settings, LogOut, Laptop, Sliders,
  HelpCircle, User, Bell, ShieldCheck, CheckCircle2
} from "lucide-react";

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/login-activity") {
      return location.pathname === "/login-activity" || location.pathname === "/activity";
    }
    if (path === "/password-health") {
      return location.pathname === "/password-health" || (location.pathname === "/tools" && location.search.includes("tab=health"));
    }
    if (path === "/devices") {
      return location.pathname === "/devices" || (location.pathname === "/monitoring" && location.search.includes("tab=devices"));
    }
    if (path === "/tools") {
      return location.pathname === "/tools" && !location.search.includes("tab=health");
    }
    return location.pathname === path;
  };

  const navLinkStyle = (path) => {
    const active = isActive(path);
    return {
      display: "flex",
      alignItems: "center",
      gap: "11px",
      padding: "9px 12px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: active ? 700 : 500,
      textDecoration: "none",
      transition: "all 0.15s ease",
      background: active ? "rgba(37, 99, 235, 0.15)" : "transparent",
      color: active ? "#60a5fa" : "#8ea5c8",
      borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
      boxShadow: active ? "0 2px 8px rgba(37, 99, 235, 0.15)" : "none"
    };
  };

  return (
    <aside style={{
      width: "250px",
      background: "#07152f",
      borderRight: "1px solid rgba(59, 130, 246, 0.18)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      flexShrink: 0
    }}>
      {/* Brand Header matching Sign In */}
      <div style={{
        padding: "20px 20px",
        borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "rgba(37, 99, 235, 0.2)",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa"
        }}>
          <Shield size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "16px", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            SecureVault
          </div>
          <div style={{ fontSize: "10px", color: "#8ea5c8", fontWeight: 500, marginTop: "2px" }}>
            Your secrets. Our priority.
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 10px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Core Navigation */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 6px" }}>
            Vault & Keys
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Link to="/dashboard" style={navLinkStyle("/dashboard")}>
              <Activity size={16} /> Overview
            </Link>
            <Link to="/vault" style={navLinkStyle("/vault")}>
              <Key size={16} /> Vault
            </Link>
            <Link to="/tools" style={navLinkStyle("/tools")}>
              <Sliders size={16} /> Password Generator
            </Link>
            <Link to="/password-health" style={navLinkStyle("/password-health")}>
              <ShieldCheck size={16} /> Password Health
            </Link>
            <Link to="/shared" style={navLinkStyle("/shared")}>
              <Lock size={16} /> Shared Credentials
            </Link>
          </div>
        </div>

        {/* Security & Monitoring */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 6px" }}>
            Security & Controls
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Link to="/monitoring" style={navLinkStyle("/monitoring")}>
              <Shield size={16} /> Security Center
            </Link>
            <Link to="/login-activity" style={navLinkStyle("/login-activity")}>
              <Activity size={16} /> Login Activity
            </Link>
            <Link to="/devices" style={navLinkStyle("/devices")}>
              <Laptop size={16} /> Devices
            </Link>
            <Link to="/reports" style={navLinkStyle("/reports")}>
              <FileText size={16} /> Reports
            </Link>
            <Link to="/teams" style={navLinkStyle("/teams")}>
              <Users size={16} /> Team Groups
            </Link>
          </div>
        </div>

        {/* Role-Based Administration */}
        {role === "ROLE_ADMINISTRATOR" && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 6px" }}>
              Administration
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <Link to="/admin" style={navLinkStyle("/admin")}>
                <Shield size={16} color="#f87171" /> Admin Center
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile & Utilities */}
      <div style={{
        padding: "14px",
        borderTop: "1px solid rgba(59, 130, 246, 0.15)",
        background: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      }}>
        <Link to="/settings" style={navLinkStyle("/settings")}>
          <Settings size={16} /> Settings
        </Link>

        {/* User Identity Pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          borderRadius: "8px",
          background: "rgba(37, 99, 235, 0.08)",
          marginTop: "4px"
        }}>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "Vault Principal"}
            </div>
            <div style={{ fontSize: "11px", color: "#8ea5c8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email || "Encrypted Session"}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center"
            }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
