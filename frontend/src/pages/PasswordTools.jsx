import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import {
  Key, RefreshCw, Copy, Check, ShieldCheck, AlertTriangle,
  Sliders, Shield, CheckCircle2, ArrowRight, Eye, EyeOff
} from "lucide-react";

export default function PasswordTools() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "health" ? "health" : "generator";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [length, setLength] = useState(16);
  const [rules, setRules] = useState({
    upper: true,
    lower: true,
    numbers: true,
    special: true
  });
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Vault credentials for health audit
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let numbers = "0123456789";
    let special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let pool = "";
    let mandatory = "";

    if (rules.upper) { pool += upper; mandatory += upper[Math.floor(Math.random() * upper.length)]; }
    if (rules.lower) { pool += lower; mandatory += lower[Math.floor(Math.random() * lower.length)]; }
    if (rules.numbers) { pool += numbers; mandatory += numbers[Math.floor(Math.random() * numbers.length)]; }
    if (rules.special) { pool += special; mandatory += special[Math.floor(Math.random() * special.length)]; }

    if (!pool) return;

    let res = mandatory;
    for (let i = mandatory.length; i < length; i++) {
      res += pool[Math.floor(Math.random() * pool.length)];
    }

    const shuffled = res.split("").sort(() => Math.random() - 0.5).join("");
    setGeneratedPassword(shuffled);
  };

  useEffect(() => {
    generate();
    api.getCredentials().then((data) => {
      if (Array.isArray(data)) setCredentials(data);
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthRating = (p) => {
    if (!p) return { label: "Weak", color: "#ef4444", pct: "25%" };
    let score = 0;
    if (p.length >= 10) score++;
    if (p.length >= 14) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;

    if (score >= 4) return { label: "Strong", color: "#10b981", pct: "100%" };
    if (score >= 2) return { label: "Moderate", color: "#f59e0b", pct: "65%" };
    return { label: "Weak", color: "#ef4444", pct: "30%" };
  };

  const strength = getStrengthRating(generatedPassword);

  // Audit Calculations
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

  return (
    <div className="content-body" style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
          {activeTab === "generator" ? "Password Generator" : "Password Health"}
        </h1>
        <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
          {activeTab === "generator"
            ? "Create a strong, unique password for your account."
            : "Review the strength and reuse of passwords across your vault."}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid rgba(59, 130, 246, 0.15)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("generator")}
          className={`btn ${activeTab === "generator" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Sliders size={14} /> Password Generator
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`btn ${activeTab === "health" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ShieldCheck size={14} /> Password Health ({credentials.length})
        </button>
      </div>

      {activeTab === "generator" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Output Display Card */}
          <div className="cyber-card" style={{ padding: "26px" }}>
            <div style={{
              padding: "16px 20px",
              background: "#081630",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "20px",
                fontWeight: 600,
                color: "#60a5fa",
                letterSpacing: "1.5px",
                wordBreak: "break-all"
              }}>
                {generatedPassword}
              </span>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={generate}
                  className="btn btn-secondary"
                  style={{ padding: "8px 12px" }}
                  title="Regenerate"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={handleCopy}
                  className="btn btn-primary"
                  style={{ padding: "8px 16px" }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied" : "Copy Password"}
                </button>
              </div>
            </div>

            {/* Strength Indicator */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "#8ea5c8" }}>Password Strength: <strong style={{ color: strength.color }}>{strength.label}</strong></span>
              <span style={{ fontSize: "12px", color: "#8ea5c8" }}>{length} characters</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: strength.pct, background: strength.color, transition: "width 0.25s ease" }} />
            </div>
          </div>

          {/* Configuration Options */}
          <div className="cyber-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "18px" }}>
              Customization Options
            </h3>

            {/* Slider */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>
                <span>Password length</span>
                <span style={{ color: "#60a5fa", fontFamily: "var(--font-mono)" }}>{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => { setLength(parseInt(e.target.value)); generate(); }}
                style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
              />
            </div>

            {/* Rule Checkboxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#cbd5e1" }}>
                <input
                  type="checkbox"
                  checked={rules.upper}
                  onChange={(e) => { setRules({ ...rules, upper: e.target.checked }); generate(); }}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                Uppercase letters (A-Z)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#cbd5e1" }}>
                <input
                  type="checkbox"
                  checked={rules.lower}
                  onChange={(e) => { setRules({ ...rules, lower: e.target.checked }); generate(); }}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                Lowercase letters (a-z)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#cbd5e1" }}>
                <input
                  type="checkbox"
                  checked={rules.numbers}
                  onChange={(e) => { setRules({ ...rules, numbers: e.target.checked }); generate(); }}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                Numbers (0-9)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#cbd5e1" }}>
                <input
                  type="checkbox"
                  checked={rules.special}
                  onChange={(e) => { setRules({ ...rules, special: e.target.checked }); generate(); }}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                Special symbols (!@#$%)
              </label>
            </div>

            <button
              onClick={generate}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px", fontSize: "13px" }}
            >
              <RefreshCw size={14} /> Generate Password
            </button>
          </div>
        </div>
      ) : (
        /* Password Health Tab */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {credentials.length === 0 ? (
            <div className="cyber-card empty-state">
              <div className="empty-state-icon">
                <ShieldCheck size={26} />
              </div>
              <div className="empty-state-title">Add credentials to see your password health.</div>
              <div className="empty-state-desc">
                Once items are saved in your vault, this audit checks for weak, reused, or compromised passwords.
              </div>
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div className="cyber-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>Strong passwords</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>{strongCredentials.length}</div>
                  <span style={{ fontSize: "12px", color: "#8ea5c8" }}>Meets security standards</span>
                </div>

                <div className="cyber-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#f87171", fontWeight: 700, textTransform: "uppercase" }}>Weak passwords</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>{weakCredentials.length}</div>
                  <span style={{ fontSize: "12px", color: "#8ea5c8" }}>Susceptible to guessing</span>
                </div>

                <div className="cyber-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#c084fc", fontWeight: 700, textTransform: "uppercase" }}>Reused passwords</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>{reusedCredentials.length}</div>
                  <span style={{ fontSize: "12px", color: "#8ea5c8" }}>Shared across accounts</span>
                </div>

                <div className="cyber-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700, textTransform: "uppercase" }}>Total items audited</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>{credentials.length}</div>
                  <span style={{ fontSize: "12px", color: "#8ea5c8" }}>Under zero-knowledge audit</span>
                </div>
              </div>

              {/* Weak Passwords List */}
              {weakCredentials.length > 0 && (
                <div className="cyber-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#f87171", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertTriangle size={16} /> Passwords needing review ({weakCredentials.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {weakCredentials.map((c) => (
                      <div key={c.id} style={{ padding: "10px 14px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "13px" }}>{c.title}</div>
                          <div style={{ fontSize: "11px", color: "#8ea5c8" }}>{c.username || "—"}</div>
                        </div>
                        <span className="badge badge-rose">Short / Low Complexity</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
