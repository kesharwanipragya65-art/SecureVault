import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import {
  Lock, Eye, EyeOff, Copy, Check, Edit3, Shield,
  Clock, AlertCircle, Share2, CheckCircle2, Users, RefreshCw, Trash2, Mail
} from "lucide-react";

export default function SharedVault() {
  const [activeTab, setActiveTab] = useState("with-me");
  const [sharesWithMe, setSharesWithMe] = useState([]);
  const [sharesByMe, setSharesByMe] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [editingShare, setEditingShare] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", username: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadShares = () => {
    setLoading(true);
    Promise.all([
      api.getMyShares().catch(() => []),
      api.getSharesByMe().catch(() => [])
    ])
      .then(([withMe, byMe]) => {
        if (Array.isArray(withMe)) setSharesWithMe(withMe);
        if (Array.isArray(byMe)) setSharesByMe(byMe);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load shared credentials. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadShares();
  }, []);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openEditModal = (s) => {
    setEditingShare(s);
    setEditForm({
      title: s.title || "",
      username: s.username || "",
      password: s.password || ""
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.updateSharedCredential(editingShare.id, editForm.title, editForm.username, editForm.password);
      setMessage("Shared credential successfully updated");
      setEditingShare(null);
      loadShares();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to update shared credential");
    }
  };

  const handleRevokeShare = async (id, recipientEmail) => {
    if (!window.confirm(`Revoke shared credential access for ${recipientEmail || "this user"}?`)) return;
    try {
      await api.revokeShare(id);
      setMessage(`Delegated access revoked for ${recipientEmail || "user"}`);
      setSharesByMe((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to revoke share");
    }
  };

  const getPermissionBadge = (perm) => {
    switch (perm) {
      case "FULL_MANAGEMENT": return <span className="badge badge-emerald">Full Management</span>;
      case "EDIT_ACCESS": return <span className="badge badge-blue">Edit Access</span>;
      default: return <span className="badge badge-slate">View Only</span>;
    }
  };

  const currentList = activeTab === "with-me" ? sharesWithMe : sharesByMe;

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
            Shared Credentials
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Securely access and manage credentials shared across team members
          </p>
        </div>

        <button
          onClick={loadShares}
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

      {/* Tabs: Shared With Me & Shared By Me */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid rgba(59, 130, 246, 0.15)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("with-me")}
          className={`btn ${activeTab === "with-me" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 18px" }}
        >
          Shared With Me ({sharesWithMe.length})
        </button>
        <button
          onClick={() => setActiveTab("by-me")}
          className={`btn ${activeTab === "by-me" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 18px" }}
        >
          Shared By Me ({sharesByMe.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#8ea5c8" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <div>Synchronizing shared credentials...</div>
        </div>
      ) : activeTab === "by-me" ? (
        sharesByMe.length === 0 ? (
          <div className="cyber-card empty-state">
            <div className="empty-state-icon">
              <Share2 size={24} />
            </div>
            <div className="empty-state-title">No credentials shared by you</div>
            <div className="empty-state-desc">
              Credentials you delegate to others from your vault will appear here.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
            {sharesByMe.map((s) => {
              const isRevealed = revealed[s.id];
              return (
                <div key={s.id} className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                          {s.title}
                        </h3>
                        <div style={{ marginTop: "4px" }}>
                          {getPermissionBadge(s.permission)}
                        </div>
                      </div>

                      {s.expiresAt && (
                        <span style={{ fontSize: "11px", color: "#fbbf24", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> Exp: {new Date(s.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Recipient */}
                    <div style={{
                      padding: "8px 12px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)",
                      marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px"
                    }}>
                      <Mail size={14} color="#60a5fa" />
                      <div>
                        <span style={{ fontSize: "10px", color: "#8ea5c8", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Shared With</span>
                        <span style={{ fontSize: "13px", color: "#38bdf8", fontWeight: 600 }}>{s.sharedUserEmail || "Delegate"}</span>
                      </div>
                    </div>

                    {/* Account / Username */}
                    <div style={{
                      padding: "8px 12px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)",
                      marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div>
                        <span style={{ fontSize: "10px", color: "#8ea5c8", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Account / Username</span>
                        <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{s.username || "—"}</span>
                      </div>
                      {s.username && (
                        <button
                          onClick={() => handleCopy(s.username, `bm-user-${s.id}`)}
                          className="btn btn-ghost"
                          style={{ padding: "4px", color: copiedKey === `bm-user-${s.id}` ? "#34d399" : "#8ea5c8" }}
                        >
                          {copiedKey === `bm-user-${s.id}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>

                    {/* Password */}
                    <div style={{
                      padding: "8px 12px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)",
                      marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div>
                        <span style={{ fontSize: "10px", color: "#8ea5c8", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Password</span>
                        <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: isRevealed ? "#60a5fa" : "#cbd5e1", letterSpacing: isRevealed ? "normal" : "2px" }}>
                          {isRevealed ? s.password : "••••••••••••"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <button
                          onClick={() => toggleReveal(s.id)}
                          className="btn btn-ghost"
                          style={{ padding: "4px", color: "#8ea5c8" }}
                        >
                          {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => handleCopy(s.password, `bm-pass-${s.id}`)}
                          className="btn btn-ghost"
                          style={{ padding: "4px", color: copiedKey === `bm-pass-${s.id}` ? "#34d399" : "#8ea5c8" }}
                        >
                          {copiedKey === `bm-pass-${s.id}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(59, 130, 246, 0.12)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="badge badge-emerald">
                      Active Delegation
                    </span>
                    <button
                      onClick={() => handleRevokeShare(s.id, s.sharedUserEmail)}
                      className="btn btn-danger"
                      style={{ padding: "5px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Trash2 size={13} /> Revoke Access
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : sharesWithMe.length === 0 ? (
        <div className="cyber-card empty-state">
          <div className="empty-state-icon">
            <Lock size={26} />
          </div>
          <div className="empty-state-title">No shared credentials</div>
          <div className="empty-state-desc">
            Credentials shared with you by other team members will appear here.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {sharesWithMe.map((s) => {
            const isRevealed = revealed[s.id];
            const canEdit = s.permission === "EDIT_ACCESS" || s.permission === "FULL_MANAGEMENT";

            return (
              <div key={s.id} className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                        {s.title}
                      </h3>
                      <div style={{ marginTop: "4px" }}>
                        {getPermissionBadge(s.permission)}
                      </div>
                    </div>

                    {s.expiresAt && (
                      <span style={{ fontSize: "11px", color: "#fbbf24", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> Exp: {new Date(s.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Username */}
                  <div style={{
                    padding: "8px 12px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)",
                    marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#8ea5c8", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Account / Email</span>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{s.username || "—"}</span>
                    </div>
                    {s.username && (
                      <button
                        onClick={() => handleCopy(s.username, `suser-${s.id}`)}
                        className="btn btn-ghost"
                        style={{ padding: "4px", color: copiedKey === `suser-${s.id}` ? "#34d399" : "#8ea5c8" }}
                      >
                        {copiedKey === `suser-${s.id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Password */}
                  <div style={{
                    padding: "8px 12px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)",
                    marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#8ea5c8", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Password</span>
                      <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: isRevealed ? "#60a5fa" : "#cbd5e1", letterSpacing: isRevealed ? "normal" : "2px" }}>
                        {isRevealed ? s.password : "••••••••••••"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <button
                        onClick={() => toggleReveal(s.id)}
                        className="btn btn-ghost"
                        style={{ padding: "4px", color: "#8ea5c8" }}
                      >
                        {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleCopy(s.password, `spass-${s.id}`)}
                        className="btn btn-ghost"
                        style={{ padding: "4px", color: copiedKey === `spass-${s.id}` ? "#34d399" : "#8ea5c8" }}
                      >
                        {copiedKey === `spass-${s.id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(59, 130, 246, 0.12)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#8ea5c8" }}>
                    {canEdit ? "Write access enabled" : "Read-only access"}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(s)}
                      className="btn btn-secondary"
                      style={{ padding: "5px 12px", fontSize: "12px" }}
                    >
                      <Edit3 size={13} /> Edit Item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Shared Modal */}
      {editingShare && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "460px" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(59, 130, 246, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Edit Shared Credential
              </h3>
              <button onClick={() => setEditingShare(null)} style={{ background: "none", border: "none", color: "#8ea5c8", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Username / Account</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setEditingShare(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
