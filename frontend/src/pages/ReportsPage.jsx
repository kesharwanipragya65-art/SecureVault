import React, { useState } from "react";
import { FileText, Download, Shield, FileCheck, Activity, AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, KeyRound } from "lucide-react";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState("");

  const handleDownload = async (format, reportType) => {
    const key = `${reportType}-${format}`;
    setDownloading(key);
    setDownloadStatus(`Generating ${format.toUpperCase()} export...`);
    const token = localStorage.getItem("token");

    try {
      const url = `http://localhost:8080/api/reports/${format}?type=${reportType}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to generate report file");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `securevault-${reportType}-report.${format === "pdf" ? "pdf" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setDownloadStatus("Report downloaded successfully.");
      setTimeout(() => setDownloadStatus(""), 3500);
    } catch (err) {
      alert("Error generating report: " + err.message);
      setDownloadStatus("");
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: "security",
      title: "Security Report",
      description: "Overall security posture evaluation including multi-factor authentication status, device health, and active risk scoring.",
      icon: Shield,
      color: "#38bdf8"
    },
    {
      id: "health",
      title: "Password Health Report",
      description: "Detailed inventory of vault password hygiene, highlighting weak credentials, duplicates, and passwords needing review.",
      icon: KeyRound,
      color: "#60a5fa"
    },
    {
      id: "audit",
      title: "Audit Report",
      description: "Comprehensive compliance log of vault item creation, credential modifications, delegations, and administrative actions.",
      icon: FileCheck,
      color: "#34d399"
    },
    {
      id: "activity",
      title: "User Activity Report",
      description: "Chronological log of login attempts, recognized hardware endpoints, and session authentication events.",
      icon: Activity,
      color: "#a78bfa"
    },
    {
      id: "threat",
      title: "Threat Monitoring Report",
      description: "Summary of detected failed sign-ins, security alerts, anomalous access attempts, and resolution histories.",
      icon: AlertTriangle,
      color: "#f87171"
    }
  ];

  return (
    <div className="content-body">
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
          Reports
        </h1>
        <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
          Export audit trails and security assessments in PDF and Excel formats
        </p>
      </div>

      {downloadStatus && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16} /> {downloadStatus}
        </div>
      )}

      {/* Reports Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {reports.map((r) => {
          const Icon = r.icon;
          const isPdfDownloading = downloading === `${r.id}-pdf`;
          const isExcelDownloading = downloading === `${r.id}-excel`;

          return (
            <div key={r.id} className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "10px",
                  background: `${r.color}20`, color: r.color,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px"
                }}>
                  <Icon size={22} />
                </div>

                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                  {r.title}
                </h2>
                <p style={{ fontSize: "13px", color: "#8ea5c8", lineHeight: "1.55", marginBottom: "20px" }}>
                  {r.description}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid rgba(59, 130, 246, 0.12)", paddingTop: "16px" }}>
                <button
                  onClick={() => handleDownload("pdf", r.id)}
                  disabled={downloading !== null}
                  className="btn btn-primary"
                  style={{ fontSize: "12px", padding: "8px 12px" }}
                >
                  {isPdfDownloading ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                  Export PDF
                </button>
                <button
                  onClick={() => handleDownload("excel", r.id)}
                  disabled={downloading !== null}
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", padding: "8px 12px" }}
                >
                  {isExcelDownloading ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                  Export Excel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
