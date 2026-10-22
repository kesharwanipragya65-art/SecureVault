import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  Shield, KeyRound, CheckCircle2, AlertTriangle, ArrowRight,
  Mail, Lock, Globe, ShieldCheck, ArrowLeft
} from "lucide-react";
import vaultImg from "../assets/securevault.png";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.forgotPassword(email.trim().toLowerCase());
      setMessage(res);
      if (res.includes("token: ")) {
        const extracted = res.split("token: ")[1]?.trim();
        if (extracted) setToken(extracted);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to initiate recovery token");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token.trim() || !newPassword.trim()) {
      setError("Recovery token and new password are required");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.resetPassword(token.trim(), newPassword);
      setMessage(res);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#061024",
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1040px",
        minHeight: "600px",
        background: "#ffffff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(37, 99, 235, 0.15)",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr"
      }}>
        {/* Left Side: Deep Navy Vault Showcase */}
        <div style={{
          background: "linear-gradient(170deg, #07152f 0%, #050e21 100%)",
          padding: "44px 40px",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(37, 99, 235, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa"
              }}>
                <Shield size={22} />
              </div>
              <div>
                <span style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "-0.02em", color: "#ffffff", display: "block", lineHeight: 1.1 }}>
                  SecureVault
                </span>
                <span style={{ fontSize: "11px", color: "#8ea5c8", fontWeight: 500 }}>
                  Your secrets. Our priority.
                </span>
              </div>
            </div>

            <h1 style={{
              fontSize: "30px",
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "8px"
            }}>
              Account Recovery.<br />
              <span style={{ color: "#3b82f6" }}>Safe & Verified.</span>
            </h1>

            <div style={{ width: "36px", height: "3px", background: "#3b82f6", borderRadius: "2px", marginBottom: "16px" }} />

            <p style={{ fontSize: "13px", color: "#94a9c9", lineHeight: "1.6", maxWidth: "380px" }}>
              Regain access to your encrypted credentials with a single-use verified recovery token.
            </p>
          </div>

          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <img
              src={vaultImg}
              alt="SecureVault Safe"
              style={{
                width: "280px",
                maxWidth: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 25px rgba(37, 99, 235, 0.3))"
              }}
            />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "20px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                <KeyRound size={16} />
              </div>
              <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 600, display: "block" }}>Single-Use Token</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                <Lock size={16} />
              </div>
              <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 600, display: "block" }}>Zero-Knowledge</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                <ShieldCheck size={16} />
              </div>
              <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 600, display: "block" }}>Instant Reset</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recovery Form */}
        <div style={{
          padding: "44px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#0f172a"
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
              <Globe size={14} />
              <span>English ▾</span>
            </div>
          </div>

          <div>
            <div style={{ textAlign: "center", marginBottom: "26px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                {step === 1 ? "Reset your password" : "Set new password"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                {step === 1
                  ? "Enter your email address to receive a secure recovery token"
                  : "Enter the token and choose a new master password"}
              </p>
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            {message && (
              <div style={{
                padding: "10px 14px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} /> {message}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestToken} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Email address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px 11px 40px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        color: "#0f172a",
                        outline: "none"
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                    marginTop: "6px"
                  }}
                >
                  {loading ? "Sending..." : "Send Recovery Token"} <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Recovery token
                  </label>
                  <input
                    type="text"
                    placeholder="Paste recovery token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                      color: "#0f172a",
                      outline: "none"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    New password
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="password"
                      placeholder="Enter at least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px 11px 40px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        color: "#0f172a",
                        outline: "none"
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)"
                  }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    width: "100%",
                    padding: "9px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Back to request token
                </button>
              </form>
            )}
          </div>

          <div style={{ textAlign: "center", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
            <Link to="/login" style={{ color: "#2563eb", fontWeight: 600, fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
