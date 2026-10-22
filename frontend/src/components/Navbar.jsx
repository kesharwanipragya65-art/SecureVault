import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import {
  Bell, Plus, CheckCircle, ShieldAlert, KeyRound,
  ShieldCheck, Check, Clock, Shield
} from "lucide-react";

export default function Navbar({ onOpenAddModal, title = "Security Overview" }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    api.getNotifications()
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      })
      .catch((err) => console.warn("Failed to load notifications", err));
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header style={{
      height: "64px",
      background: "rgba(7, 21, 47, 0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(59, 130, 246, 0.18)",
      padding: "0 36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50
    }}>
      {/* Title & Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "12px", color: "#8ea5c8", fontWeight: 600 }}>
          SecureVault
        </span>
        <span style={{ color: "#334155", fontSize: "12px" }}>/</span>
        <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
          {title}
        </h1>
      </div>

      {/* Action Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Live Security Status Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "9999px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.28)",
          color: "#34d399",
          fontSize: "11px",
          fontWeight: 600
        }}>
          <ShieldCheck size={13} />
          <span>Protected (AES-256)</span>
        </div>

        {/* Quick Add Credential Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="btn btn-primary"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            <Plus size={15} /> Add Credential
          </button>
        )}

        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              background: "rgba(37, 99, 235, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa",
              cursor: "pointer",
              position: "relative"
            }}
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "17px",
                height: "17px",
                borderRadius: "50%",
                background: "#ef4444",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #07152f"
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifs && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "46px",
              width: "340px",
              background: "#0b1a38",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              borderRadius: "12px",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.7)",
              zIndex: 100,
              overflow: "hidden"
            }}>
              <div style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="badge badge-rose">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#8ea5c8", fontSize: "13px" }}>
                    <ShieldCheck size={28} color="#10b981" style={{ margin: "0 auto 8px auto" }} />
                    <div style={{ fontWeight: 600, color: "#ffffff" }}>You're all caught up.</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>No unread security alerts or notifications.</div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(59, 130, 246, 0.08)",
                        background: n.read ? "transparent" : "rgba(37, 99, 235, 0.08)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px"
                      }}
                    >
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "6px",
                        background: n.type === "ALERT" ? "rgba(239, 68, 68, 0.15)" : "rgba(37, 99, 235, 0.15)",
                        color: n.type === "ALERT" ? "#f87171" : "#60a5fa",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {n.type === "ALERT" ? <ShieldAlert size={14} /> : <CheckCircle size={14} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "2px" }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
