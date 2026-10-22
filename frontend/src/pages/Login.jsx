import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import {
  Shield, Lock, Eye, EyeOff, Mail, CheckCircle2,
  AlertTriangle, ArrowRight, ArrowLeft, Globe, ShieldCheck, KeyRound, UserPlus
} from "lucide-react";
import vaultImg from "../assets/securevault.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [useMfa, setUseMfa] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // MFA Challenge State
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaCode, setMfaCode] = useState("");

  const { saveToken } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login(email.trim().toLowerCase(), password);

      if (res && res.status === "MFA_REQUIRED") {
        setMfaChallenge(res);
        setLoading(false);
        return;
      }

      const token = typeof res === "string" ? res : res.token;
      await saveToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email address or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await api.verifyMfa(mfaChallenge.tempToken, mfaCode.trim());
      await saveToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid MFA verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setError("");
    setLoading(true);
    try {
      const demoEmail = provider.toLowerCase() + "_user@example.com";
      const token = await api.oauthLogin(provider, demoEmail, `${provider} Verified User`);
      await saveToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || `OAuth login with ${provider} failed`);
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
      {/* Split-screen master container card */}
      <div style={{
        width: "100%",
        maxWidth: "1040px",
        minHeight: "640px",
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
          position: "relative",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          {/* Top Logo */}
          <div>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", textDecoration: "none", cursor: "pointer" }}>
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
            </Link>

            {/* Headline */}
            <h1 style={{
              fontSize: "30px",
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "8px"
            }}>
              Secure. Store.<br />
              Access with <span style={{ color: "#3b82f6" }}>Confidence.</span>
            </h1>

            {/* Blue accent bar */}
            <div style={{ width: "36px", height: "3px", background: "#3b82f6", borderRadius: "2px", marginBottom: "16px" }} />

            <p style={{ fontSize: "13px", color: "#94a9c9", lineHeight: "1.6", maxWidth: "380px" }}>
              SecureVault helps you store your credentials safely with end-to-end encryption and multi-factor authentication.
            </p>
          </div>

          {/* 3D Vault Illustration */}
          <div style={{ textAlign: "center", margin: "20px 0", position: "relative" }}>
            <img
              src={vaultImg}
              alt="SecureVault Safe"
              style={{
                width: "300px",
                maxWidth: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 25px rgba(37, 99, 235, 0.3))"
              }}
            />
          </div>

          {/* Bottom 3 Pillars */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "20px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                <CheckCircle2 size={16} />
              </div>
              <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 600, display: "block", lineHeight: 1.3 }}>
                End-to-End Encryption
              </span>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                <Lock size={16} />
              </div>
              <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 600, display: "block", lineHeight: 1.3 }}>
                Multi-Factor Auth
              </span>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                <ShieldCheck size={16} />
              </div>
              <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 600, display: "block", lineHeight: 1.3 }}>
                Secure Cloud Vault
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean White Auth Panel */}
        <div style={{
          padding: "44px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#0f172a"
        }}>
          {/* Top Bar with Back to Home & Language Indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer"
            }}>
              <Globe size={14} />
              <span>English ▾</span>
            </div>
          </div>

          <div>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "26px" }}>
              <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                {mfaChallenge ? "Two-Factor Verification" : "Sign in to SecureVault"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                {mfaChallenge
                  ? `Enter the 6-digit authenticator code for ${mfaChallenge.email}`
                  : "Access your secure password vault"}
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

            {!mfaChallenge ? (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Email Address */}
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
                        outline: "none",
                        transition: "all 0.15s ease"
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: 0 }}>
                      Password
                    </label>
                    <Link to="/forgot-password" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                      Forgot Password?
                    </Link>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 40px 11px 40px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        color: "#0f172a",
                        outline: "none",
                        transition: "all 0.15s ease"
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & MFA Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#475569", margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#2563eb", cursor: "pointer" }}
                    />
                    Remember me
                  </label>

                  <div
                    onClick={() => setUseMfa(!useMfa)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "#475569", fontWeight: 600 }}
                  >
                    <span>Use MFA</span>
                    <ShieldCheck size={14} color="#2563eb" />
                    <div style={{
                      width: "34px",
                      height: "18px",
                      borderRadius: "10px",
                      background: useMfa ? "#2563eb" : "#cbd5e1",
                      position: "relative",
                      transition: "background 0.2s ease"
                    }}>
                      <div style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        position: "absolute",
                        top: "2px",
                        left: useMfa ? "18px" : "2px",
                        transition: "left 0.2s ease"
                      }} />
                    </div>
                  </div>
                </div>

                {/* Primary Sign In Button */}
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
                    transition: "all 0.15s ease",
                    marginTop: "6px"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#1d4ed8"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#2563eb"}
                >
                  <Lock size={15} />
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                {/* OR Divider */}
                <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                  <span style={{ padding: "0 12px", fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                    OR
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                </div>

                {/* New to SecureVault? Create an account link */}
                <Link
                  to="/register"
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "#ffffff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                    transition: "all 0.15s ease"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#93c5fd"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                >
                  <UserPlus size={16} />
                  New to SecureVault? Create an account
                </Link>

                {/* Single Sign-On */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("Google")}
                    style={{
                      padding: "8px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer"
                    }}
                  >
                    Google SSO
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("GitHub")}
                    style={{
                      padding: "8px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer"
                    }}
                  >
                    GitHub SSO
                  </button>
                </div>
              </form>
            ) : (
              /* MFA Challenge Mode */
              <form onSubmit={handleVerifyMfa} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center", marginBottom: "8px" }}>
                    6-Digit Security Passcode
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      textAlign: "center",
                      fontSize: "22px",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "6px",
                      borderRadius: "8px",
                      border: "1px solid #2563eb",
                      boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
                      outline: "none"
                    }}
                    required
                    autoFocus
                  />
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", display: "block", textAlign: "center" }}>
                    Enter code from Google Authenticator or Authy.
                  </span>
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
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => { setMfaChallenge(null); setMfaCode(""); }}
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
                  Back to Password Login
                </button>
              </form>
            )}
          </div>

          {/* Footer Security Note */}
          <div style={{
            textAlign: "center",
            paddingTop: "20px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#64748b"
          }}>
            <ShieldCheck size={14} color="#2563eb" />
            <span>Your data is protected with AES-256 encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
