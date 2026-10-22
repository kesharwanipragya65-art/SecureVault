import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  Shield, Lock, Eye, EyeOff, User, Mail, CheckCircle2,
  AlertTriangle, ArrowRight, ArrowLeft, Globe, ShieldCheck
} from "lucide-react";
import vaultImg from "../assets/securevault.png";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("ROLE_USER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const calculateStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { label: "Weak", color: "#ef4444", width: "30%" };
    if (score <= 4) return { label: "Moderate", color: "#f59e0b", width: "65%" };
    return { label: "Strong", color: "#10b981", width: "100%" };
  };

  const strength = calculateStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.register(name.trim(), email.trim().toLowerCase(), password, role);
      setSuccess("Account successfully created. Redirecting to sign in...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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

            <div style={{ width: "36px", height: "3px", background: "#3b82f6", borderRadius: "2px", marginBottom: "16px" }} />

            <p style={{ fontSize: "13px", color: "#94a9c9", lineHeight: "1.6", maxWidth: "380px" }}>
              SecureVault helps you store your credentials safely with end-to-end encryption and multi-factor authentication.
            </p>
          </div>

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

        {/* Right Side: Clean White Registration Form */}
        <div style={{
          padding: "40px 44px",
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
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Create your SecureVault account
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                Secure your passwords and credentials in one place.
              </p>
            </div>

            {error && (
              <div style={{
                padding: "9px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: "9px 14px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} /> {success}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                  Full name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 40px",
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

              {/* Email Address */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
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
                      padding: "10px 14px 10px 40px",
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

              {/* Account Type (Clean, informative display without cluttering role selector) */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                  Account type
                </label>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: "14px",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <span>Personal account</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                    Standard
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: 0 }}>
                    Password
                  </label>
                  {password && (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: strength.color }}>
                      {strength.label}
                    </span>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 40px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none"
                    }}
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

                {/* Password strength bar */}
                {password && (
                  <div style={{ height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "2px", marginTop: "6px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: strength.width, background: strength.color, transition: "width 0.25s ease" }} />
                  </div>
                )}
              </div>

              {/* Submit Button */}
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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>

          {/* Bottom Link & Footer */}
          <div style={{ textAlign: "center", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </span>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#94a3b8",
              marginTop: "10px"
            }}>
              <ShieldCheck size={13} color="#2563eb" />
              <span>Your data is protected with AES-256 encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
