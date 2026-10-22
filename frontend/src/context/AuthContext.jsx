import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!localStorage.getItem("token")) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data);
    } catch (err) {
      console.warn("Session check failed", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const saveToken = async (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setLoading(true);
    try {
      const data = await api.getMe();
      setUser(data);
      return data;
    } catch (err) {
      console.warn("Session check failed after login", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore network errors on logout
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role || "ROLE_USER",
        isAuthenticated: !!token && !!user,
        loading,
        saveToken,
        logout,
        refreshUser: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      token: null,
      user: null,
      role: "ROLE_USER",
      isAuthenticated: false,
      loading: false,
      saveToken: async () => {},
      logout: async () => {},
      refreshUser: async () => {}
    };
  }
  return context;
};

