import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import CredentialModal from "../components/CredentialModal";
import ShareModal from "../components/ShareModal";
import {
  Key, Search, Plus, Star, Eye, EyeOff, Copy, Check,
  Share2, Edit3, Trash2, Shield, RefreshCw, Lock, ExternalLink
} from "lucide-react";

export default function Vault() {
  const [credentials, setCredentials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = ["ALL", "General", "Work", "Personal", "Finance", "Development"];

  const loadCredentials = () => {
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
        setError("Unable to load your vault credentials. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCredentials();
    const handleReload = () => loadCredentials();
    window.addEventListener("vault:reload", handleReload);
    return () => window.removeEventListener("vault:reload", handleReload);
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      loadCredentials();
      return;
    }
    api.searchCredentials(q)
      .then((data) => {
        if (Array.isArray(data)) setCredentials(data);
      })
      .catch(console.error);
  };

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      await api.toggleFavorite(id);
      loadCredentials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCredential = async (data) => {
    try {
      if (data.id) {
        await api.updateCredential(data.id, data);
      } else {
        await api.addCredential(data);
      }
      setModalOpen(false);
      setEditingItem(null);
      loadCredentials();
    } catch (err) {
      alert(err.message || "Failed to save credential");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently remove "${title}" from your encrypted vault?`)) return;
    try {
      await api.deleteCredential(id);
      loadCredentials();
    } catch (err) {
      alert(err.message || "Failed to delete credential");
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCredentials = credentials.filter((c) => {
    if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;
    if (favoriteOnly && !c.favorite) return false;
    return true;
  });

  return (
    <div className="content-body">
      {/* Top Header */}
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
            Your Vault
          </h1>
          <p style={{ fontSize: "14px", color: "#8ea5c8", marginTop: "4px" }}>
            Securely store, retrieve, and manage encrypted passwords and credentials
          </p>
        </div>

        <button
          onClick={() => { setEditingItem(null); setModalOpen(true); }}
          className="btn btn-primary"
          style={{ padding: "9px 18px", fontSize: "13px" }}
        >
          <Plus size={16} /> Add Credential
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          borderRadius: "10px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="cyber-card" style={{ padding: "14px 18px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 300px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8ea5c8" }} />
            <input
              type="text"
              placeholder="Search vault items..."
              value={searchQuery}
              onChange={handleSearch}
              className="input-field"
              style={{ paddingLeft: "38px" }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: selectedCategory === cat ? "#2563eb" : "#081630",
                  color: selectedCategory === cat ? "#ffffff" : "#8ea5c8",
                  boxShadow: selectedCategory === cat ? "0 2px 8px rgba(37,99,235,0.3)" : "none"
                }}
              >
                {cat === "ALL" ? "All Items" : cat}
              </button>
            ))}

            {/* Favorite Filter Toggle */}
            <button
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: favoriteOnly ? "rgba(245, 158, 11, 0.2)" : "#081630",
                color: favoriteOnly ? "#fbbf24" : "#8ea5c8"
              }}
            >
              <Star size={13} fill={favoriteOnly ? "#fbbf24" : "none"} />
              Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Vault Items List / Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#8ea5c8" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <div>Decrypting vault records...</div>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="cyber-card empty-state">
          <div className="empty-state-icon">
            <Lock size={26} />
          </div>
          <div className="empty-state-title">
            {credentials.length === 0 ? "Your vault is empty" : "No matching credentials found"}
          </div>
          <div className="empty-state-desc" style={{ marginBottom: "18px" }}>
            {credentials.length === 0
              ? "Add your first credential to get started."
              : "Try adjusting your search query or category filters."}
          </div>
          {credentials.length === 0 && (
            <button
              onClick={() => { setEditingItem(null); setModalOpen(true); }}
              className="btn btn-primary"
              style={{ padding: "8px 18px" }}
            >
              <Plus size={15} /> Add Credential
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {filteredCredentials.map((c) => {
            const isRevealed = revealedPasswords[c.id];
            return (
              <div key={c.id} className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  {/* Top Bar: Title, Category, Favorite */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "8px",
                        background: "rgba(37, 99, 235, 0.15)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa"
                      }}>
                        <Key size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#ffffff" }}>
                          {c.title}
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: "10px", marginTop: "3px" }}>
                          {c.category || "General"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(c.id, e)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: c.favorite ? "#f59e0b" : "#64748b", padding: "4px" }}
                      title={c.favorite ? "Favorited" : "Add to favorites"}
                    >
                      <Star size={18} fill={c.favorite ? "#f59e0b" : "none"} />
                    </button>
                  </div>

                  {/* Username Field */}
                  <div style={{
                    padding: "8px 12px", background: "#081630", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.12)",
                    marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontSize: "10px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                        Account / Email
                      </span>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>
                        {c.username || "—"}
                      </span>
                    </div>
                    {c.username && (
                      <button
                        onClick={() => handleCopy(c.username, `user-${c.id}`)}
                        className="btn btn-ghost"
                        style={{ padding: "4px 8px", color: copiedKey === `user-${c.id}` ? "#34d399" : "#8ea5c8" }}
                        title="Copy account identifier"
                      >
                        {copiedKey === `user-${c.id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Password Field */}
                  <div style={{
                    padding: "8px 12px", background: "#081630", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.12)",
                    marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#8ea5c8", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                        Password
                      </span>
                      <span style={{
                        fontSize: "13px", fontFamily: "var(--font-mono)",
                        color: isRevealed ? "#60a5fa" : "#cbd5e1",
                        letterSpacing: isRevealed ? "normal" : "2px"
                      }}>
                        {isRevealed ? c.password : "••••••••••••"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <button
                        onClick={() => toggleReveal(c.id)}
                        className="btn btn-ghost"
                        style={{ padding: "4px 6px", color: "#8ea5c8" }}
                        title={isRevealed ? "Mask password" : "Reveal password"}
                      >
                        {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleCopy(c.password, `pass-${c.id}`)}
                        className="btn btn-ghost"
                        style={{ padding: "4px 6px", color: copiedKey === `pass-${c.id}` ? "#34d399" : "#8ea5c8" }}
                        title="Copy password"
                      >
                        {copiedKey === `pass-${c.id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {c.url && (
                    <div style={{ fontSize: "11px", color: "#8ea5c8", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <a href={c.url.startsWith("http") ? c.url : `https://${c.url}`} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <ExternalLink size={11} /> {c.url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Card Actions: Share, Edit, Delete */}
                <div style={{ borderTop: "1px solid rgba(59, 130, 246, 0.12)", paddingTop: "12px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button
                    onClick={() => setShareItem(c)}
                    className="btn btn-secondary"
                    style={{ padding: "5px 10px", fontSize: "12px" }}
                    title="Delegate to team member"
                  >
                    <Share2 size={13} /> Share
                  </button>

                  <button
                    onClick={() => { setEditingItem(c); setModalOpen(true); }}
                    className="btn btn-secondary"
                    style={{ padding: "5px 10px", fontSize: "12px" }}
                    title="Edit credential"
                  >
                    <Edit3 size={13} /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(c.id, c.title)}
                    className="btn btn-danger"
                    style={{ padding: "5px 10px", fontSize: "12px" }}
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Credential Modal */}
      <CredentialModal
        isOpen={modalOpen}
        item={editingItem}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveCredential}
      />

      {/* Share Credential Modal */}
      {shareItem && (
        <ShareModal
          credential={shareItem}
          onClose={() => setShareItem(null)}
          onSuccess={() => { setShareItem(null); loadCredentials(); }}
        />
      )}
    </div>
  );
}