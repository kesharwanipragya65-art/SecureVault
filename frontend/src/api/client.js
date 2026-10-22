const API_BASE = "http://localhost:8080";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    // If session invalidated or unauthorized
    const text = await res.text();
    if (localStorage.getItem("token") && text.includes("revoked")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error(text || "Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed with status " + res.status);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export const api = {
  // Authentication & MFA
  register: (name, email, password, role = "ROLE_USER") =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ name, email, password, role })
    }).then(handleResponse),

  login: (email, password) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ email, password })
    }).then(handleResponse),

  verifyMfa: (tempToken, code) =>
    fetch(`${API_BASE}/api/auth/mfa/verify`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ tempToken, code })
    }).then(handleResponse),

  setupMfa: () =>
    fetch(`${API_BASE}/api/auth/mfa/setup`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  enableMfa: (code) =>
    fetch(`${API_BASE}/api/auth/mfa/enable`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ code })
    }).then(handleResponse),

  disableMfa: (password) =>
    fetch(`${API_BASE}/api/auth/mfa/disable`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ password })
    }).then(handleResponse),

  forgotPassword: (email) =>
    fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ email })
    }).then(handleResponse),

  resetPassword: (token, newPassword) =>
    fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ token, newPassword })
    }).then(handleResponse),

  oauthLogin: (provider, email, name) =>
    fetch(`${API_BASE}/api/auth/oauth2/callback`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ provider, email, name })
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse).finally(() => {
      localStorage.removeItem("token");
    }),

  getMe: () =>
    fetch(`${API_BASE}/api/auth/me`, {
      headers: authHeaders()
    }).then(handleResponse),

  // Vault Credentials
  getCredentials: () =>
    fetch(`${API_BASE}/api/vault/credentials`, {
      headers: authHeaders()
    }).then(handleResponse),

  searchCredentials: (query) =>
    fetch(`${API_BASE}/api/vault/credentials/search?query=${encodeURIComponent(query)}`, {
      headers: authHeaders()
    }).then(handleResponse),

  filterCredentials: (type, category, favoriteOnly) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    if (favoriteOnly) params.append("favoriteOnly", "true");
    return fetch(`${API_BASE}/api/vault/credentials/filter?${params.toString()}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },

  addCredential: (data) =>
    fetch(`${API_BASE}/api/vault/credentials`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams(data)
    }).then(handleResponse),

  updateCredential: (id, data) =>
    fetch(`${API_BASE}/api/vault/credentials/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: new URLSearchParams(data)
    }).then(handleResponse),

  toggleFavorite: (id) =>
    fetch(`${API_BASE}/api/vault/credentials/${id}/favorite`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  deleteCredential: (id) =>
    fetch(`${API_BASE}/api/vault/credentials/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    }).then(handleResponse),

  // Sharing
  shareCredential: (credentialId, email, permission, expiresAt) =>
    fetch(`${API_BASE}/api/sharing/share`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({
        credentialId,
        email,
        permission,
        ...(expiresAt ? { expiresAt } : {})
      })
    }).then(handleResponse),

  getMyShares: () =>
    fetch(`${API_BASE}/api/sharing/mine`, {
      headers: authHeaders()
    }).then(handleResponse),

  getSharesByMe: () =>
    fetch(`${API_BASE}/api/sharing/by-me`, {
      headers: authHeaders()
    }).then(handleResponse),

  updateSharedCredential: (shareId, title, username, password) =>
    fetch(`${API_BASE}/api/sharing/${shareId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: new URLSearchParams({ title, username, password })
    }).then(handleResponse),

  revokeShare: (shareId) =>
    fetch(`${API_BASE}/api/sharing/${shareId}`, {
      method: "DELETE",
      headers: authHeaders()
    }).then(handleResponse),

  // Teams
  getTeams: () =>
    fetch(`${API_BASE}/api/teams`, {
      headers: authHeaders()
    }).then(handleResponse),

  createTeam: (name) =>
    fetch(`${API_BASE}/api/teams`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ name })
    }).then(handleResponse),

  getTeamMembers: (teamId) =>
    fetch(`${API_BASE}/api/teams/${teamId}/members`, {
      headers: authHeaders()
    }).then(handleResponse),

  addTeamMember: (teamId, email, role = "MEMBER") =>
    fetch(`${API_BASE}/api/teams/${teamId}/members`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams({ email, role })
    }).then(handleResponse),

  removeTeamMember: (teamId, memberId) =>
    fetch(`${API_BASE}/api/teams/${teamId}/members/${memberId}`, {
      method: "DELETE",
      headers: authHeaders()
    }).then(handleResponse),

  createTeamCredential: (teamId, data) =>
    fetch(`${API_BASE}/api/teams/${teamId}/credentials`, {
      method: "POST",
      headers: authHeaders(),
      body: new URLSearchParams(data)
    }).then(handleResponse),

  addCredentialToTeam: (teamId, credentialId) =>
    fetch(`${API_BASE}/api/teams/${teamId}/credentials/${credentialId}`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  getTeamCredentials: (teamId) =>
    fetch(`${API_BASE}/api/teams/${teamId}/credentials`, {
      headers: authHeaders()
    }).then(handleResponse),

  // Security Monitoring & Analytics
  getLoginHistory: () =>
    fetch(`${API_BASE}/api/security/login-history`, {
      headers: authHeaders()
    }).then(handleResponse),

  getAnalytics: (timeRange = "all") =>
    fetch(`${API_BASE}/api/security/analytics?timeRange=${timeRange}`, {
      headers: authHeaders()
    }).then(handleResponse),

  getAlerts: () =>
    fetch(`${API_BASE}/api/security/alerts`, {
      headers: authHeaders()
    }).then(handleResponse),

  resolveAlert: (id) =>
    fetch(`${API_BASE}/api/security/alerts/${id}/resolve`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  getDevices: () =>
    fetch(`${API_BASE}/api/security/devices`, {
      headers: authHeaders()
    }).then(handleResponse),

  trustDevice: (id) =>
    fetch(`${API_BASE}/api/security/devices/${id}/trust`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  revokeDevice: (id) =>
    fetch(`${API_BASE}/api/security/devices/${id}/revoke`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  getAuditLogs: () =>
    fetch(`${API_BASE}/api/security/audit-logs`, {
      headers: authHeaders()
    }).then(handleResponse),

  getNotifications: () =>
    fetch(`${API_BASE}/api/security/notifications`, {
      headers: authHeaders()
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${API_BASE}/api/security/notifications/${id}/read`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  // Reports
  downloadReportUrl: (format, type = "activity") =>
    `${API_BASE}/api/reports/${format}?type=${type}`,

  // Administrator Center
  adminGetUsers: () =>
    fetch(`${API_BASE}/api/admin/users`, {
      headers: authHeaders()
    }).then(handleResponse),

  adminUpdateRole: (userId, role) =>
    fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: authHeaders(),
      body: new URLSearchParams({ role })
    }).then(handleResponse),

  adminGetAuditLogs: () =>
    fetch(`${API_BASE}/api/admin/audit-logs`, {
      headers: authHeaders()
    }).then(handleResponse),

  adminGetSecurityEvents: () =>
    fetch(`${API_BASE}/api/admin/security-events`, {
      headers: authHeaders()
    }).then(handleResponse),

  adminGetSystemStats: () =>
    fetch(`${API_BASE}/api/admin/system-stats`, {
      headers: authHeaders()
    }).then(handleResponse)
};
