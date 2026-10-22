import React, { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, X, Shield, Lock, Sliders, Check } from "lucide-react";

export default function CredentialModal({ isOpen, onClose, onSave, editingCredential, item }) {
  const target = editingCredential || item;

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [credentialType, setCredentialType] = useState("WEBSITE");
  const [category, setCategory] = useState("General");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [favorite, setFavorite] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genLength, setGenLength] = useState(16);
  const [genRules, setGenRules] = useState({
    upper: true,
    lower: true,
    numbers: true,
    special: true
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (target) {
      setTitle(target.title || "");
      setUsername(target.username || "");
      setPassword(target.password || "");
      setCredentialType(target.credentialType || "WEBSITE");
      setCategory(target.category || "General");
      setWebsiteUrl(target.websiteUrl || target.url || "");
      setNotes(target.notes || "");
      setFavorite(!!target.favorite);
    } else {
      setTitle("");
      setUsername("");
      setPassword("");
      setCredentialType("WEBSITE");
      setCategory("General");
      setWebsiteUrl("");
      setNotes("");
      setFavorite(false);
    }
    setError("");
    setShowGenerator(false);
  }, [target, isOpen]);

  if (!isOpen) return null;

  const generatePassword = () => {
    const charSets = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      special: "!@#$%^&*()_+-=[]{}|;:,.<>?"
    };

    let pool = "";
    let mandatory = "";

    if (genRules.upper) {
      pool += charSets.upper;
      mandatory += charSets.upper[Math.floor(Math.random() * charSets.upper.length)];
    }
    if (genRules.lower) {
      pool += charSets.lower;
      mandatory += charSets.lower[Math.floor(Math.random() * charSets.lower.length)];
    }
    if (genRules.numbers) {
      pool += charSets.numbers;
      mandatory += charSets.numbers[Math.floor(Math.random() * charSets.numbers.length)];
    }
    if (genRules.special) {
      pool += charSets.special;
      mandatory += charSets.special[Math.floor(Math.random() * charSets.special.length)];
    }

    if (!pool) return;

    let res = mandatory;
    for (let i = mandatory.length; i < genLength; i++) {
      res += pool[Math.floor(Math.random() * pool.length)];
    }

    const shuffled = res.split("").sort(() => Math.random() - 0.5).join("");
    setPassword(shuffled);
  };

  const calculateStrength = (p) => {
    if (!p) return { label: "Empty", color: "#64748b", width: "0%" };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 14) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) return { label: "Weak", color: "#ef4444", width: "30%" };
    if (score <= 4) return { label: "Moderate", color: "#f59e0b", width: "65%" };
    return { label: "Strong", color: "#10b981", width: "100%" };
  };

  const strength = calculateStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !password.trim()) {
      setError("Title and password are required");
      return;
    }
    onSave({
      ...(target?.id ? { id: target.id } : {}),
      title: title.trim(),
      username: username.trim(),
      password: password.trim(),
      credentialType,
      category,
      websiteUrl: websiteUrl.trim(),
      notes: notes.trim(),
      favorite
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "540px" }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={16} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              {target ? "Edit Credential" : "Add New Credential"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#8ea5c8", cursor: "pointer", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
          {error && (
            <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderRadius: "6px", fontSize: "12px" }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="form-label">Service / Title *</label>
            <input
              type="text"
              placeholder="e.g. GitHub, AWS Console, Work Email"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Username / Email */}
          <div>
            <label className="form-label">Username / Email Address</label>
            <input
              type="text"
              placeholder="operator@company.com"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password with generator trigger */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" style={{ margin: 0 }}>Password *</label>
              <button
                type="button"
                onClick={() => {
                  setShowGenerator(!showGenerator);
                  if (!showGenerator && !password) generatePassword();
                }}
                style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Sliders size={13} /> {showGenerator ? "Hide Generator" : "Generate Password"}
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: "70px", fontFamily: showPassword ? "var(--font-mono)" : "inherit" }}
                required
              />
              <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-ghost"
                  style={{ padding: "4px", color: "#8ea5c8" }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            {password && (
              <div style={{ marginTop: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                  <span style={{ color: "#8ea5c8" }}>Strength</span>
                  <span style={{ fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: strength.width, background: strength.color, transition: "width 0.25s ease" }} />
                </div>
              </div>
            )}

            {/* Embedded Generator Tool */}
            {showGenerator && (
              <div style={{
                marginTop: "10px",
                padding: "12px",
                background: "#081630",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.25)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 600 }}>Length: {genLength}</span>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="btn btn-secondary"
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                  >
                    <RefreshCw size={11} /> Regenerate
                  </button>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={genLength}
                  onChange={(e) => { setGenLength(parseInt(e.target.value)); }}
                  style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
                />
              </div>
            )}
          </div>

          {/* Category & Website URL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="form-label">Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Finance">Finance</option>
                <option value="Development">Development</option>
              </select>
            </div>

            <div>
              <label className="form-label">Website URL</label>
              <input
                type="text"
                placeholder="https://service.com"
                className="input-field"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Secure Notes */}
          <div>
            <label className="form-label">Secure Notes</label>
            <textarea
              placeholder="Optional encrypted notes..."
              className="input-field"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Favorite Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#cbd5e1" }}>
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
            />
            Mark as favorite item
          </label>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {target ? "Save Changes" : "Save Credential"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
