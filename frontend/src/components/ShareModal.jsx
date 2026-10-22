import React, { useState } from "react";
import { X, Share2, Shield, Clock } from "lucide-react";
import { api } from "../api/client";

export default function ShareModal({ isOpen, onClose, credential, onShareSuccess, onSuccess }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("VIEW_ONLY");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const show = isOpen !== undefined ? isOpen : !!credential;
  if (!show || !credential) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Recipient email is required");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (onShareSuccess) {
        await onShareSuccess(credential.id, email.trim(), permission, expiresAt || null);
      } else {
        await api.shareCredential(credential.id, email.trim(), permission, expiresAt || null);
      }
      setSuccess(`Credential successfully shared with ${email}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccess("");
        setEmail("");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to share credential");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "480px" }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(37, 99, 235, 0.15)", color: "#60a5fa",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Share2 size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Share Credential
              </h3>
              <p style={{ fontSize: "12px", color: "#8ea5c8", margin: 0 }}>
                Sharing "{credential.title}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#8ea5c8", cursor: "pointer", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleShare} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              borderRadius: "8px",
              fontSize: "13px"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              borderRadius: "8px",
              fontSize: "13px"
            }}>
              {success}
            </div>
          )}

          <div>
            <label className="form-label">
              Recipient User Email *
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="e.g. colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">
              Access Permission Level
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="input-field"
            >
              <option value="VIEW_ONLY">View Only (Read credentials only)</option>
              <option value="EDIT_ACCESS">Edit Access (Update username/password)</option>
              <option value="FULL_MANAGEMENT">Full Management (Read, edit, re-share)</option>
            </select>
          </div>

          <div>
            <label className="form-label">
              Temporary Access Expiration (Optional)
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <span style={{ fontSize: "11px", color: "#8ea5c8", marginTop: "4px", display: "block" }}>
              Leave empty for permanent access until revoked.
            </span>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "8px",
            borderTop: "1px solid rgba(59, 130, 246, 0.12)",
            paddingTop: "14px"
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              <Share2 size={14} /> {loading ? "Sharing..." : "Grant Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
