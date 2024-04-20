import React, { useEffect, useState } from "react";
import getSessionTokenFromCookie from "../../actions/getSessionTokenFromCookie";
import ExtAuthForm from "./components/ExtAuthForm";
import BookmarkForm from "./components/BookmarkForm";
import { fetchSession } from "../../actions/sessionActions";

interface SessionRecord {
  id: string;
  userId: string;
  expires: number;
  sessionToken: string;
}

const App: React.FC = () => {
  const [sessionToken, setSessionToken] = useState<string | null>("");
  const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(
    null
  );
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
      setSessionToken(sessionToken);
    };
    fetchSessionToken();
  }, [sessionToken]);

  // Use the local session token to fetch the session from the server
  useEffect(() => {
    if (sessionToken) {
      const fetchServerSession = async () => {
        const serverSession = await fetchSession(sessionToken);

        if (serverSession) {
          setSessionRecord(serverSession);
        } else {
          setIsAuthenticated(false);
          localStorage.setItem("isAuthenticated", "false");
        }
      };
      fetchServerSession();
    }
  }, [sessionToken]);

  useEffect(() => {
    if (sessionRecord) {
      const isSessionExpired = sessionRecord?.expires < Date.now();
      setIsAuthenticated(!isSessionExpired);
      localStorage.setItem("isAuthenticated", (!isSessionExpired).toString());
    }
  }, [sessionRecord]);

  const handleSignOut = () => {
    document.cookie =
      "sessionToken=; expires Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    localStorage.setItem("isAuthenticated", "false");
    setIsAuthenticated(false);
    setSessionToken(null);
    setSessionRecord(null);
  };

  return (
    <div className="bg-zinc-800 font-sans text-sm text-gray-400">
      {isAuthenticated ? (
        <BookmarkForm
          key={isAuthenticated.toString()}
          sessionRecord={sessionRecord}
          parentOnSignOut={handleSignOut}
        />
      ) : (
        <ExtAuthForm />
      )}
    </div>
  );
};

export default App;
