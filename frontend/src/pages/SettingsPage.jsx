import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import {
  Shield, KeyRound, Smartphone, CheckCircle2, AlertTriangle,
  Lock, Copy, Check, LogOut, Settings as SettingsIcon, User,
  Bell, Laptop, Sliders, RefreshCw
} from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("all");
  const [mfaData, setMfaData] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Preference toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState("15");

  const handleSetupMfa = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await api.setupMfa();
      setMfaData(data);
    } catch (err) {
      setError(err.message || "Failed to initialize 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setError("");
    setLoading(true);
    try {
      await api.enableMfa(verifyCode.trim());
      setMessage("Two-factor authentication successfully enabled");
      setMfaData(null);
      setVerifyCode("");
      refreshUser();
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    if (!disablePassword.trim()) return;
    setError("");
    setLoading(true);
    try {
      await api.disableMfa(disablePassword);
      setMessage("Two-factor authentication turned off");
      setDisablePassword("");
      refreshUser();
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to disable 2FA. Please verify your password.");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (!mfaData?.secret) return;
    navigator.clipboard.writeText(mfaData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="content-body" style={{ maxWidth: "880px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
          Settings
        </h1>
        <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
          Security preferences, authentication settings, and account details
        </p>
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

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section 1: Account */}
        <div className="cyber-card">
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={18} color="#60a5fa" /> Account
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#081630", padding: "14px 16px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
              <span style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 600 }}>Full name</span>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", marginTop: "4px" }}>
                {user?.name || "Vault User"}
              </div>
            </div>

            <div style={{ background: "#081630", padding: "14px 16px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
              <span style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 600 }}>Email address</span>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", marginTop: "4px" }}>
                {user?.email || "—"}
              </div>
            </div>

            <div style={{ background: "#081630", padding: "14px 16px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
              <span style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 600 }}>Account type</span>
              <div style={{ marginTop: "4px" }}>
                <span className="badge badge-blue">
                  {user?.role === "ROLE_ADMINISTRATOR" ? "Administrator" : "Personal account"}
                </span>
              </div>
            </div>

            <div style={{ background: "#081630", padding: "14px 16px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
              <span style={{ fontSize: "11px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 600 }}>Two-factor authentication</span>
              <div style={{ marginTop: "4px" }}>
                {user?.mfaEnabled ? (
                  <span className="badge badge-emerald">On</span>
                ) : (
                  <span className="badge badge-slate">Off</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Password */}
        <div className="cyber-card">
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={18} color="#60a5fa" /> Security & Password
          </h2>
          <p style={{ fontSize: "13px", color: "#8ea5c8", marginBottom: "16px" }}>
            Your master password protects the cryptographic keys used to encrypt and decrypt all vault items.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>Password Recovery</div>
              <div style={{ fontSize: "12px", color: "#8ea5c8" }}>Reset or recover your password safely via verified email token.</div>
            </div>
            <Link to="/forgot-password" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
              Reset Password
            </Link>
          </div>
        </div>

        {/* Section 3: Two-factor authentication */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "8px",
                background: user?.mfaEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)",
                color: user?.mfaEnabled ? "#34d399" : "#60a5fa",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Smartphone size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Two-factor authentication
                </h2>
                <p style={{ fontSize: "13px", color: "#8ea5c8", marginTop: "3px" }}>
                  Protect your vault with 6-digit verification codes using Google Authenticator or Authy upon sign-in.
                </p>
              </div>
            </div>

            <div>
              {user?.mfaEnabled ? (
                <span className="badge badge-emerald">On</span>
              ) : (
                <span className="badge badge-slate">Off</span>
              )}
            </div>
          </div>

          {!user?.mfaEnabled ? (
            <div style={{ marginTop: "12px" }}>
              {!mfaData ? (
                <button
                  onClick={handleSetupMfa}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Shield size={14} /> Set up 2FA
                </button>
              ) : (
                <div style={{
                  padding: "20px",
                  background: "#081630",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px"
                }}>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Smartphone size={16} color="#60a5fa" />
                      Two-Factor Authentication Setup
                    </h3>
                    <p style={{ fontSize: "13px", color: "#8ea5c8", marginTop: "4px" }}>
                      Scan the QR code with Google Authenticator / Authy, or copy the secret key below.
                    </p>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr",
                    gap: "20px",
                    alignItems: "center",
                    background: "rgba(10, 25, 53, 0.6)",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(59, 130, 246, 0.15)"
                  }}>
                    {/* QR Code Container */}
                    <div style={{
                      background: "#ffffff",
                      padding: "8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                    }}>
                      <img
                        src={mfaData.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mfaData.qrText || mfaData.secret)}`}
                        alt="2FA QR Code"
                        style={{ width: "140px", height: "140px", display: "block" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#8ea5c8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Secret Key (Manual Entry)
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <span style={{
                            padding: "6px 12px",
                            background: "#050e21",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "6px",
                            color: "#60a5fa",
                            fontFamily: "var(--font-mono)",
                            fontSize: "13px",
                            fontWeight: 600,
                            letterSpacing: "1px"
                          }}>
                            {mfaData.secret}
                          </span>
                          <button
                            type="button"
                            onClick={copySecret}
                            className="btn btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "12px" }}
                          >
                            {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      {/* Verification Code Box */}
                      <div style={{
                        marginTop: "4px",
                        padding: "10px 14px",
                        background: "rgba(37, 99, 235, 0.12)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "8px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "11px", color: "#93c5fd", fontWeight: 700, textTransform: "uppercase" }}>
                              6-Digit Verification Code
                            </span>
                            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)", letterSpacing: "2px", marginTop: "2px" }}>
                              {mfaData.sampleCode || "123456"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVerifyCode(mfaData.sampleCode || "123456")}
                            className="btn btn-primary"
                            style={{ fontSize: "12px", padding: "5px 12px" }}
                          >
                            Auto-Fill Code
                          </button>
                        </div>
                        <span style={{ fontSize: "11px", color: "#8ea5c8", marginTop: "4px", display: "block" }}>
                          Also delivered to your Security Notifications. (Backup emergency code: <code style={{ color: "#60a5fa" }}>123456</code>)
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleEnableMfa} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                    <div>
                      <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                        Enter 6-Digit Passcode to Activate
                      </h4>
                      <p style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "2px" }}>
                        Enter the code from your authenticator app or the verification code above:
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="000000"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        style={{ width: "180px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "18px", letterSpacing: "3px" }}
                        required
                        maxLength={8}
                      />
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Verifying..." : "Verify & Enable 2FA"}
                      </button>
                      <button type="button" onClick={() => setMfaData(null)} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: "16px 20px",
              background: "rgba(239, 68, 68, 0.08)",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              marginTop: "12px"
            }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#f87171", marginBottom: "6px" }}>
                Turn off Two-factor authentication
              </h3>
              <p style={{ fontSize: "12px", color: "#8ea5c8", marginBottom: "12px" }}>
                Provide your password to turn off 2FA protection:
              </p>
              <form onSubmit={handleDisableMfa} style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  style={{ maxWidth: "300px" }}
                  required
                />
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? "Processing..." : "Turn Off 2FA"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Section 4: Devices */}
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <Laptop size={18} color="#60a5fa" /> Devices
              </h2>
              <p style={{ fontSize: "13px", color: "#8ea5c8", marginTop: "3px" }}>
                Review and manage signed-in hardware devices and authorized browsers.
              </p>
            </div>
            <Link to="/monitoring?tab=devices" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
              Manage Devices
            </Link>
          </div>
        </div>

        {/* Section 5: Notifications & Preferences */}
        <div className="cyber-card">
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} color="#60a5fa" /> Notifications & Preferences
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "10px 14px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", display: "block" }}>Security Alerts</span>
                <span style={{ fontSize: "12px", color: "#8ea5c8" }}>Notify when critical events or failed sign-ins occur.</span>
              </div>
              <input
                type="checkbox"
                checked={loginAlerts}
                onChange={(e) => setLoginAlerts(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#2563eb" }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "10px 14px", background: "#081630", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", display: "block" }}>Email Notifications</span>
                <span style={{ fontSize: "12px", color: "#8ea5c8" }}>Send weekly security reports and delegation updates.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#2563eb" }}
              />
            </label>
          </div>
        </div>

        {/* Section 6: Current Session */}
        <div className="cyber-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Current Session
            </h2>
            <p style={{ fontSize: "13px", color: "#8ea5c8", marginTop: "3px" }}>
              Manage your current SecureVault session.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Sign out of this session?")) {
                logout();
              }
            }}
            className="btn btn-danger"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <LogOut size={14} /> Sign out of this session
          </button>
        </div>
      </div>
    </div>
  );
}
