import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import CredentialModal from "../components/CredentialModal";
import {
  Users, Plus, Shield, UserPlus, Key, Mail, CheckCircle2,
  AlertTriangle, FolderLock, Eye, EyeOff, Copy, Check, RefreshCw,
  Trash2, ShieldCheck, UserCheck, Lock, ExternalLink
} from "lucide-react";

export default function TeamVault() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamCredentials, setTeamCredentials] = useState([]);
  const [members, setMembers] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("MEMBER");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);

  const loadTeams = (keepSelectedId = null) => {
    setLoading(true);
    api.getTeams()
      .then((data) => {
        if (Array.isArray(data)) {
          setTeams(data);
          if (keepSelectedId) {
            const found = data.find((t) => t.id === keepSelectedId);
            if (found) setSelectedTeam(found);
          } else if (data.length > 0 && !selectedTeam) {
            setSelectedTeam(data[0]);
          } else if (selectedTeam) {
            const refreshed = data.find((t) => t.id === selectedTeam.id);
            if (refreshed) setSelectedTeam(refreshed);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load team groups");
      })
      .finally(() => setLoading(false));
  };

  const loadTeamMembers = (teamId) => {
    if (!teamId) return;
    api.getTeamMembers(teamId)
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch((err) => {
        console.error("Failed to load members:", err);
        setMembers([]);
      });
  };

  const loadTeamCredentials = (teamId) => {
    if (!teamId) return;
    api.getTeamCredentials(teamId)
      .then((creds) => {
        if (Array.isArray(creds)) setTeamCredentials(creds);
      })
      .catch(() => setTeamCredentials([]));
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamCredentials(selectedTeam.id);
      loadTeamMembers(selectedTeam.id);
    } else {
      setTeamCredentials([]);
      setMembers([]);
    }
  }, [selectedTeam?.id]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setError("");
    setActionLoading(true);
    try {
      const created = await api.createTeam(newTeamName.trim());
      setMessage(`Team "${newTeamName}" created successfully!`);
      setNewTeamName("");
      loadTeams(created?.id);
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to create team");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !selectedTeam) return;
    setError("");
    setMessage("");
    setActionLoading(true);
    try {
      await api.addTeamMember(selectedTeam.id, newMemberEmail.trim(), newMemberRole);
      setMessage(`Member "${newMemberEmail.trim()}" added to "${selectedTeam.name}" successfully!`);
      setNewMemberEmail("");
      loadTeamMembers(selectedTeam.id);
      loadTeams(selectedTeam.id);
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to add team member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!selectedTeam) return;
    if (!window.confirm(`Are you sure you want to remove ${memberName || "this member"} from ${selectedTeam.name}?`)) return;
    setError("");
    try {
      await api.removeTeamMember(selectedTeam.id, memberId);
      setMessage(`Member removed from ${selectedTeam.name}.`);
      loadTeamMembers(selectedTeam.id);
      loadTeams(selectedTeam.id);
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to remove member");
    }
  };

  const handleSaveTeamCredential = async (data) => {
    if (!selectedTeam) return;
    try {
      await api.createTeamCredential(selectedTeam.id, data);
      setMessage(`Credential "${data.title}" successfully added to "${selectedTeam.name}" vault!`);
      setIsCredModalOpen(false);
      loadTeamCredentials(selectedTeam.id);
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      alert(err.message || "Failed to create team credential");
    }
  };

  const isOwnerOrAdmin = selectedTeam?.userRole === "OWNER" || selectedTeam?.userRole === "ADMIN" || selectedTeam?.userRole === "MANAGER";

  return (
    <div className="content-body">
      {/* Header */}
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
            Team Vaults
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Collaborative credential pools, role-based access, and shared team vaults
          </p>
        </div>

        <button
          onClick={() => loadTeams(selectedTeam?.id)}
          className="btn btn-secondary"
          style={{ fontSize: "12px", padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {message && (
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
          <CheckCircle2 size={16} /> {message}
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
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Team List & Create */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Create Team Form */}
          <div className="cyber-card">
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={16} color="#60a5fa" /> Create New Team
            </h3>
            <form onSubmit={handleCreateTeam} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. DevOps, Engineering, Finance"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ padding: "8px", fontSize: "13px" }}
              >
                {actionLoading ? "Creating..." : "Create Team"}
              </button>
            </form>
          </div>

          {/* Teams List */}
          <div className="cyber-card">
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Your Teams ({teams.length})</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {teams.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#8ea5c8", padding: "16px 0", textAlign: "center" }}>
                  No teams joined or created yet
                </div>
              ) : (
                teams.map((t) => {
                  const isSelected = selectedTeam?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeam(t)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(37, 99, 235, 0.2)" : "#081630",
                        border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(59, 130, 246, 0.12)",
                        color: isSelected ? "#60a5fa" : "#cbd5e1",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: 600,
                        fontSize: "13px",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <FolderLock size={16} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: t.userRole === "OWNER" ? "rgba(245, 158, 11, 0.2)" : "rgba(37, 99, 235, 0.2)",
                        color: t.userRole === "OWNER" ? "#fbbf24" : "#93c5fd",
                        textTransform: "uppercase"
                      }}>
                        {t.userRole || "MEMBER"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Team Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {selectedTeam ? (
            <>
              {/* Selected Team Overview Banner */}
              <div className="cyber-card" style={{
                background: "linear-gradient(135deg, rgba(10, 25, 53, 0.8) 0%, rgba(8, 22, 48, 0.95) 100%)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                padding: "18px 22px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                        {selectedTeam.name}
                      </h2>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: selectedTeam.userRole === "OWNER" ? "rgba(245, 158, 11, 0.2)" : "rgba(37, 99, 235, 0.2)",
                        color: selectedTeam.userRole === "OWNER" ? "#fbbf24" : "#93c5fd",
                        border: selectedTeam.userRole === "OWNER" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(37, 99, 235, 0.3)"
                      }}>
                        YOUR ROLE: {selectedTeam.userRole || "MEMBER"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#8ea5c8", marginTop: "4px" }}>
                      Owner: <strong style={{ color: "#cbd5e1" }}>{selectedTeam.ownerName || selectedTeam.ownerEmail || "Team Owner"}</strong> {selectedTeam.ownerEmail ? `(${selectedTeam.ownerEmail})` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setIsCredModalOpen(true)}
                      className="btn btn-primary"
                      style={{ fontSize: "13px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Plus size={15} /> Add Team Credential
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Member Card (Visible to Owner/Admin) */}
              {isOwnerOrAdmin && (
                <div className="cyber-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserPlus size={16} color="#60a5fa" /> Add Member to "{selectedTeam.name}"
                  </h3>
                  <form onSubmit={handleAddMember} style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: "10px", alignItems: "center" }}>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Enter registered user email (e.g. colleague@company.com)"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      required
                    />
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="input-field"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="btn btn-primary"
                      style={{ padding: "9px 18px", fontSize: "13px" }}
                    >
                      {actionLoading ? "Adding..." : "Add Member"}
                    </button>
                  </form>
                </div>
              )}

              {/* Team Members List Card */}
              <div className="cyber-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={16} color="#60a5fa" /> Team Members ({members.length})
                  </h3>
                  <button
                    onClick={() => loadTeamMembers(selectedTeam.id)}
                    className="btn-ghost"
                    style={{ fontSize: "12px", color: "#8ea5c8", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <RefreshCw size={12} /> Refresh Members
                  </button>
                </div>

                {members.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "#8ea5c8", padding: "16px 0", textAlign: "center" }}>
                    No members listed
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {members.map((m) => {
                      const isOwner = m.role === "OWNER";
                      const canDelete = isOwnerOrAdmin && !isOwner && m.id !== 0;

                      return (
                        <div
                          key={m.id || m.userId}
                          style={{
                            padding: "10px 14px",
                            background: "#081630",
                            border: "1px solid rgba(59, 130, 246, 0.12)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: isOwner ? "rgba(245, 158, 11, 0.2)" : "rgba(37, 99, 235, 0.2)",
                              color: isOwner ? "#fbbf24" : "#60a5fa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "13px"
                            }}>
                              {m.name ? m.name.charAt(0).toUpperCase() : (m.email ? m.email.charAt(0).toUpperCase() : "U")}
                            </div>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                                {m.name || "Member"}
                              </div>
                              <div style={{ fontSize: "12px", color: "#8ea5c8" }}>
                                {m.email}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "4px",
                              background: isOwner ? "rgba(245, 158, 11, 0.2)" : "rgba(37, 99, 235, 0.15)",
                              color: isOwner ? "#fbbf24" : "#93c5fd",
                              border: isOwner ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(37, 99, 235, 0.25)"
                            }}>
                              {m.role || "MEMBER"}
                            </span>

                            {canDelete && (
                              <button
                                onClick={() => handleRemoveMember(m.id, m.name || m.email)}
                                title="Remove member"
                                className="btn-ghost"
                                style={{ padding: "4px 8px", color: "#f87171" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Team Credentials Pool */}
              <div className="cyber-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Key size={16} color="#60a5fa" /> Team Credentials ({teamCredentials.length})
                  </h3>
                  <button
                    onClick={() => setIsCredModalOpen(true)}
                    className="btn btn-primary"
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Plus size={13} /> Add Credential
                  </button>
                </div>

                {teamCredentials.length === 0 ? (
                  <div className="empty-state" style={{ padding: "36px 16px" }}>
                    <div className="empty-state-icon">
                      <Key size={22} />
                    </div>
                    <div className="empty-state-title">No credentials in this team vault</div>
                    <div className="empty-state-desc" style={{ maxWidth: "380px", margin: "6px auto 16px auto" }}>
                      Store shared logins, database credentials, and API secrets for your team members to securely access.
                    </div>
                    <button
                      onClick={() => setIsCredModalOpen(true)}
                      className="btn btn-primary"
                      style={{ fontSize: "13px", padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Plus size={15} /> Add First Team Credential
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "14px" }}>
                    {teamCredentials.map((c) => {
                      const isRevealed = revealed[c.id];
                      return (
                        <div key={c.id} style={{
                          padding: "14px 16px",
                          background: "#081630",
                          border: "1px solid rgba(59, 130, 246, 0.18)",
                          borderRadius: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>
                              {c.title}
                            </div>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "rgba(37, 99, 235, 0.2)",
                              color: "#60a5fa"
                            }}>
                              {c.credentialType || "WEBSITE"}
                            </span>
                          </div>

                          <div style={{ fontSize: "12px", color: "#8ea5c8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Username: <strong style={{ color: "#cbd5e1" }}>{c.username || "—"}</strong></span>
                            {c.username && (
                              <button
                                onClick={() => handleCopy(c.username, `tuser-${c.id}`)}
                                className="btn-ghost"
                                style={{ padding: "2px 6px", color: copiedKey === `tuser-${c.id}` ? "#34d399" : "#8ea5c8" }}
                              >
                                {copiedKey === `tuser-${c.id}` ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            )}
                          </div>

                          <div style={{ fontSize: "12px", color: "#8ea5c8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Password: <span style={{ fontFamily: "var(--font-mono)", color: isRevealed ? "#60a5fa" : "#cbd5e1", letterSpacing: isRevealed ? "normal" : "2px" }}>{isRevealed ? c.password : "••••••••••••"}</span></span>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => toggleReveal(c.id)}
                                className="btn-ghost"
                                style={{ padding: "2px 6px", color: "#8ea5c8" }}
                                title={isRevealed ? "Hide Password" : "Show Password"}
                              >
                                {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                onClick={() => handleCopy(c.password, `tpass-${c.id}`)}
                                className="btn-ghost"
                                style={{ padding: "2px 6px", color: copiedKey === `tpass-${c.id}` ? "#34d399" : "#8ea5c8" }}
                                title="Copy Password"
                              >
                                {copiedKey === `tpass-${c.id}` ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>

                          {c.websiteUrl && (
                            <div style={{ fontSize: "11px", color: "#60a5fa", display: "flex", alignItems: "center", gap: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              <ExternalLink size={11} /> {c.websiteUrl}
                            </div>
                          )}

                          {c.notes && (
                            <div style={{ fontSize: "11px", color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "6px" }}>
                              {c.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cyber-card empty-state">
              <div className="empty-state-icon">
                <FolderLock size={26} />
              </div>
              <div className="empty-state-title">No team selected</div>
              <div className="empty-state-desc">
                Select a team from the list or create a new team to manage collaborative credentials.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Credential Creation Modal */}
      {isCredModalOpen && (
        <CredentialModal
          isOpen={isCredModalOpen}
          onClose={() => setIsCredModalOpen(false)}
          onSave={handleSaveTeamCredential}
        />
      )}
    </div>
  );
}
