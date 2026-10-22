import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import CredentialModal from "../components/CredentialModal";
import {
  ShieldCheck, AlertTriangle, Key, CheckCircle2, ShieldAlert,
  RefreshCw, ArrowRight, Edit3, Copy, Check, Eye, EyeOff, Sliders
} from "lucide-react";

export default function PasswordHealth() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'weak' | 'reused' | 'strong'
  const [editingItem, setEditingItem] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const loadData = () => {
    setLoading(true);
    api.getCredentials()
      .then((data) => {
        if (Array.isArray(data)) {
          setCredentials(data);
          setError("");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load credentials for security health audit.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
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

  const handleSaveCredential = async (data) => {
    try {
      if (data.id) {
        await api.updateCredential(data.id, data);
      } else {
        await api.addCredential(data);
      }
      setEditingItem(null);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to save credential");
    }
  };

  // Health calculations
  const weakCredentials = credentials.filter((c) => {
    const p = c.password || "";
    return p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p) || !/[^a-zA-Z0-9]/.test(p);
  });

  const passwordCounts = credentials.reduce((acc, c) => {
    if (c.password) acc[c.password] = (acc[c.password] || 0) + 1;
    return acc;
  }, {});

  const reusedCredentials = credentials.filter((c) => passwordCounts[c.password] > 1);

  const strongCredentials = credentials.filter((c) => {
    const p = c.password || "";
    return p.length >= 14 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p);
  });

  const total = credentials.length;
  const healthScore = total === 0 ? 100 : Math.max(0, Math.round(100 - (weakCredentials.length * 20 + reusedCredentials.length * 15) / total * 2));

  let displayedList = credentials;
  if (filter === "weak") displayedList = weakCredentials;
  if (filter === "reused") displayedList = reusedCredentials;
  if (filter === "strong") displayedList = strongCredentials;

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
            Password Health Audit
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Real-time cryptographic audit of your stored vault credentials
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to="/tools"
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Sliders size={13} /> Password Generator
          </Link>
          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Re-audit
          </button>
        </div>
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

      {/* Metrics Banner */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "12px",
            background: healthScore >= 80 ? "rgba(16, 185, 129, 0.15)" : healthScore >= 50 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: healthScore >= 80 ? "#34d399" : healthScore >= 50 ? "#fbbf24" : "#f87171",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Health Score</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>{healthScore}<span style={{ fontSize: "14px", color: "#8ea5c8" }}>/100</span></div>
          </div>
        </div>

        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => setFilter("weak")}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Weak Passwords</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: weakCredentials.length > 0 ? "#f87171" : "#ffffff", lineHeight: 1.1 }}>{weakCredentials.length}</div>
          </div>
        </div>

        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => setFilter("reused")}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Reused Passwords</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: reusedCredentials.length > 0 ? "#fbbf24" : "#ffffff", lineHeight: 1.1 }}>{reusedCredentials.length}</div>
          </div>
        </div>

        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => setFilter("strong")}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Strong Passwords</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#34d399", lineHeight: 1.1 }}>{strongCredentials.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid rgba(59, 130, 246, 0.15)", paddingBottom: "12px" }}>
        <button
          onClick={() => setFilter("all")}
          className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          All Items ({credentials.length})
        </button>
        <button
          onClick={() => setFilter("weak")}
          className={`btn ${filter === "weak" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Weak ({weakCredentials.length})
        </button>
        <button
          onClick={() => setFilter("reused")}
          className={`btn ${filter === "reused" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Reused ({reusedCredentials.length})
        </button>
        <button
          onClick={() => setFilter("strong")}
          className={`btn ${filter === "strong" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Strong ({strongCredentials.length})
        </button>
      </div>

      {/* Credentials List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#8ea5c8" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <div>Auditing password complexity...</div>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="cyber-card empty-state">
          <div className="empty-state-icon">
            <CheckCircle2 size={24} color="#34d399" />
          </div>
          <div className="empty-state-title">
            {filter === "weak" ? "No weak passwords found" : filter === "reused" ? "No reused passwords found" : "No credentials in vault"}
          </div>
          <div className="empty-state-desc">
            {filter === "all" ? "Add credentials to your vault to see health metrics." : "All checked items meet or exceed security standards."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {displayedList.map((c) => {
            const isRevealed = revealed[c.id];
            const p = c.password || "";
            const isWeak = p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p) || !/[^a-zA-Z0-9]/.test(p);
            const isReused = (passwordCounts[p] || 0) > 1;

            return (
              <div key={c.id} className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                        {c.title}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "2px" }}>
                        {c.category || "General"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      {isWeak && <span className="badge badge-rose">Weak</span>}
                      {isReused && <span className="badge badge-amber">Reused</span>}
                      {!isWeak && !isReused && <span className="badge badge-emerald">Secure</span>}
                    </div>
                  </div>

                  <div style={{
                    padding: "8px 12px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)",
                    marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#8ea5c8", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Username</span>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{c.username || "—"}</span>
                    </div>
                    {c.username && (
                      <button
                        onClick={() => handleCopy(c.username, `ph-u-${c.id}`)}
                        className="btn btn-ghost"
                        style={{ padding: "4px", color: copiedKey === `ph-u-${c.id}` ? "#34d399" : "#8ea5c8" }}
                      >
                        {copiedKey === `ph-u-${c.id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>

                  <div style={{
                    padding: "8px 12px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)",
                    marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#8ea5c8", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Password</span>
                      <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: isRevealed ? "#60a5fa" : "#cbd5e1", letterSpacing: isRevealed ? "normal" : "2px" }}>
                        {isRevealed ? p : "••••••••••••"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <button
                        onClick={() => toggleReveal(c.id)}
                        className="btn btn-ghost"
                        style={{ padding: "4px", color: "#8ea5c8" }}
                      >
                        {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleCopy(p, `ph-p-${c.id}`)}
                        className="btn btn-ghost"
                        style={{ padding: "4px", color: copiedKey === `ph-p-${c.id}` ? "#34d399" : "#8ea5c8" }}
                      >
                        {copiedKey === `ph-p-${c.id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(59, 130, 246, 0.12)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: isWeak ? "#f87171" : isReused ? "#fbbf24" : "#34d399" }}>
                    {isWeak ? "Recommend upgrading to 16+ chars" : isReused ? "Identical password in multiple accounts" : "Compliant with AES security profile"}
                  </span>
                  <button
                    onClick={() => setEditingItem(c)}
                    className="btn btn-secondary"
                    style={{ padding: "5px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Edit3 size={13} /> Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Credential Modal */}
      {editingItem && (
        <CredentialModal
          isOpen={!!editingItem}
          initialData={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveCredential}
        />
      )}
    </div>
  );
}
