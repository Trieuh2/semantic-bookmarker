import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "../types";
import { getSessionTokenFromCookie } from "../actions/cookieActions";
import { fetchSession, deleteSession } from "../actions/sessionActions";

interface SessionContextType {
  userId: string;
  sessionToken: string;
  sessionRecord: Session | null;
  isAuthenticated: boolean;
  handleSignOut: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userId, setUserId] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [sessionRecord, setSessionRecord] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("isAuthenticated") === "true"
  );

  // Fetch the local session token from the local cookie data
  useEffect(() => {
    const fetchSessionToken = async () => {
      const sessionToken = await getSessionTokenFromCookie();
      if (!sessionToken) {
        setIsAuthenticated(false);
        localStorage.setItem("isAuthenticated", "false");
      }
      setSessionToken(sessionToken ?? "");
    };
    fetchSessionToken();
  }, [sessionToken]);

  // Use the local session token to fetch the session from the server
  useEffect(() => {
    if (sessionToken) {
      const fetchServerSession = async () => {
        const serverSession = await fetchSession(sessionToken);

        if (serverSession) {
          const isSessionExpired = serverSession?.expires < Date.now();
          setIsAuthenticated(!isSessionExpired);
          localStorage.setItem(
            "isAuthenticated",
            (!isSessionExpired).toString()
          );
          setSessionRecord(serverSession);
          setUserId(serverSession.userId);
        } else {
          setIsAuthenticated(false);
          localStorage.setItem("isAuthenticated", "false");
        }
      };
      fetchServerSession();
    }
  }, [sessionToken]);

  const handleSignOut = () => {
    const performSignOut = async () => {
      await deleteSession(sessionToken);
      document.cookie =
        "sessionToken=; expires Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      localStorage.setItem("isAuthenticated", "false");
      setIsAuthenticated(false);
      setSessionToken("");
      setSessionRecord(null);
    };
    performSignOut();
  };

  return (
    <>
      <SessionContext.Provider
        value={{
          userId,
          sessionToken,
          sessionRecord,
          isAuthenticated,
          handleSignOut,
        }}
      >
        {children}
      </SessionContext.Provider>
    </>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
