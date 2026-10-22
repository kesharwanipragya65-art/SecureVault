import React from "react";
import { Link } from "react-router-dom";
import {
  Shield, Key, Lock, Users, Activity, FileCheck, ArrowRight,
  CheckCircle2, ShieldCheck, Cpu, Database, EyeOff, Radio
} from "lucide-react";
import vaultImg from "../assets/securevault.png";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#071328", color: "#ffffff", fontFamily: "var(--font-main)" }}>
      {/* Top Header */}
      <header style={{
        padding: "18px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(59, 130, 246, 0.18)",
        background: "rgba(7, 21, 47, 0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "rgba(37, 99, 235, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#60a5fa"
          }}>
            <Shield size={20} />
          </div>
          <div>
            <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em", color: "#ffffff", display: "block", lineHeight: 1.1 }}>
              SecureVault
            </span>
            <span style={{ fontSize: "10px", color: "#8ea5c8", fontWeight: 500 }}>
              Your secrets. Our priority.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: "8px 16px" }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: "8px 18px" }}>
            Create Account <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: "1140px",
        margin: "0 auto",
        padding: "70px 24px 50px",
        textAlign: "center"
      }}>
        {/* <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 14px",
          borderRadius: "9999px",
          background: "rgba(37, 99, 235, 0.15)",
          border: "1px solid rgba(59, 130, 246, 0.35)",
          color: "#60a5fa",
          fontSize: "12px",
          fontWeight: 700,
          marginBottom: "20px",
          letterSpacing: "0.04em",
          textTransform: "uppercase"
        }}>
          <ShieldCheck size={14} /> Zero-Knowledge Password Vault
        </div> */}

        <h1 style={{
          fontSize: "44px",
          fontWeight: 800,
          lineHeight: 1.18,
          letterSpacing: "-0.03em",
          marginBottom: "18px",
          color: "#ffffff"
        }}>
          SecureVault
          {/* <br />
          Access with <span style={{ color: "#38bdf8" }}>Confidence.</span> */}
        </h1>

        <p style={{
          fontSize: "16px",
          color: "#8ea5c8",
          maxWidth: "680px",
          margin: "0 auto 32px",
          lineHeight: 1.6
        }}>
          SecureVault protects your sensitive credentials with end-to-end AES-256 encryption, multi-factor authentication, granular sharing permissions, and real-time security monitoring.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginBottom: "40px" }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
            Create Account <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: "12px 24px", fontSize: "14px" }}>
            Sign in to SecureVault
          </Link>
        </div>

        {/* 3D Isometric Safe Graphic */}
        {/* <div style={{ textAlign: "center", position: "relative" }}>
          <img
            src={vaultImg}
            alt="SecureVault Safe"
            style={{
              width: "360px",
              maxWidth: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 25px 45px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 30px rgba(37, 99, 235, 0.35))"
            }}
          />
        </div> */}
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: "1140px", margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            {/* Engineered for Modern Cybersecurity */}
            Securely manage your passwords and credentials
          </h2>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "6px" }}>
            Everything required to manage credentials securely across individual and team workflows
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px"
        }}>
          <div className="cyber-card">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <Lock size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "#ffffff" }}>
              AES-256 Encryption
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6 }}>
              All vault credentials are encrypted with AES-256 at rest. Only verified authenticated owners can decrypt and view their credentials.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <Key size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "#ffffff" }}>
              Two-Factor Authentication
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6 }}>
              Enforce time-based one-time passcodes (TOTP) during login using Google Authenticator or Authy to prevent unauthorized account access.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "#ffffff" }}>
              Delegated Credential Sharing
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6 }}>
              Share credentials with team members with fine-grained permissions: View Only, Edit Access, or Full Management with automatic revocation.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <Activity size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "#ffffff" }}>
              Security Center & Monitoring
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6 }}>
              Monitor sign-in activity, review unrecognized devices, audit password health, and receive immediate security alerts.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <FileCheck size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "#ffffff" }}>
              Audit Reports & Export
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6 }}>
              Export audit trails, password health summaries, and user activity reports in PDF and Excel formats.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(167, 139, 250, 0.15)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "#ffffff" }}>
              Password Tools & Generator
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6 }}>
              Generate strong, unique passwords with custom character rules and identify at-risk credentials automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section style={{
        background: "rgba(5, 14, 33, 0.6)",
        borderTop: "1px solid rgba(59, 130, 246, 0.15)",
        borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
        padding: "60px 24px"
      }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Security Architecture
            </span>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
              {/* Zero-Trust Security Principles */}
              Security built into every part of SecureVault
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            <div className="cyber-card" style={{ background: "#06132b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <EyeOff size={18} color="#38bdf8" />
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Zero-Knowledge Vault</h4>
              </div>
              <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.5, margin: 0 }}>
                Keys never transit in plain text. Credentials remain fully encrypted and unreadable by administrators.
              </p>
            </div>

            <div className="cyber-card" style={{ background: "#06132b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <Cpu size={18} color="#34d399" />
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Hardware & Session Binding</h4>
              </div>
              <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.5, margin: 0 }}>
                Each login is verified against device fingerprints and browser signatures to detect session hijacking.
              </p>
            </div>

            <div className="cyber-card" style={{ background: "#06132b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <Radio size={18} color="#fbbf24" />
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Active Threat Detection</h4>
              </div>
              <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.5, margin: 0 }}>
                Rapid failed attempts, unrecognized IPs, and geo-anomalies trigger immediate rate-limiting and security alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: "1140px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff" }}>
            How SecureVault Works
          </h2>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Three simple steps to enterprise-grade password management
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div className="cyber-card" style={{ position: "relative" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "#2563eb", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 800, marginBottom: "14px"
            }}>1</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
              Create Your Account
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6, margin: 0 }}>
              Register with your email and secure master credentials. Enable two-factor authentication via TOTP.
            </p>
          </div>

          <div className="cyber-card" style={{ position: "relative" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "#2563eb", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 800, marginBottom: "14px"
            }}>2</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
              Store & Audit Credentials
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6, margin: 0 }}>
              Add credentials to your vault, generate high-entropy passwords, and run real-time password health audits.
            </p>
          </div>

          <div className="cyber-card" style={{ position: "relative" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "#2563eb", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 800, marginBottom: "14px"
            }}>3</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
              Share & Monitor
            </h3>
            <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: 1.6, margin: 0 }}>
              Delegate credentials to team members with granular permissions and audit every authentication attempt in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{
        maxWidth: "960px",
        margin: "0 auto 80px",
        padding: "48px 32px",
        background: "linear-gradient(135deg, rgba(37, 99, 235, 0.18) 0%, rgba(14, 165, 233, 0.12) 100%)",
        border: "1px solid rgba(59, 130, 246, 0.35)",
        borderRadius: "16px",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff", marginBottom: "12px" }}>
          Start Securing Your Credentials Today
        </h2>
        <p style={{ fontSize: "14px", color: "#cbd5e1", maxWidth: "560px", margin: "0 auto 24px", lineHeight: 1.6 }}>
          Experience end-to-end encrypted password storage, granular sharing, and proactive security monitoring.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: "12px 28px" }}>
            Get Started Free <ArrowRight size={15} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: "12px 24px" }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(59, 130, 246, 0.18)",
        padding: "28px 48px",
        background: "#07152f",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={16} color="#60a5fa" />
          <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 700 }}>SecureVault</span>
          <span style={{ fontSize: "12px", color: "#8ea5c8" }}>— Enterprise Credential Management</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#8ea5c8" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", display: "inline-block" }}></span>
            All Systems Operational
          </span>
          <span>© 2026 SecureVault</span>
        </div>
      </footer>
    </div>
  );
}
