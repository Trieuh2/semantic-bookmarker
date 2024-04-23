"use client";

import { getSession, signOut } from "next-auth/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  userId: string;
  sessionToken: string;
  setUserId: (userId: string) => void;
  setSessionToken: (sessionToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");

  useEffect(() => {
    const fetchSession = async () => {
      const nextAuthSession = await getSession();
      if (nextAuthSession) {
        setUserId(nextAuthSession.userId ?? "");
        setSessionToken(nextAuthSession.sessionToken ?? "");
      }
    };
    fetchSession();
  }, []);

  const logout = async () => {
    await signOut();
    setUserId("");
    setSessionToken("");
  };

  const value = useMemo(
    () => ({
      userId,
      sessionToken,
      setUserId,
      setSessionToken,
      logout,
    }),
    [userId, sessionToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
