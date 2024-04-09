import React, { useEffect, useState } from "react";
import getSessionTokenFromCookie from "../../actions/getSessionTokenFromCookie";
import getServerSession from "../../actions/getServerSession";
import ExtAuthForm from "./components/extAuthForm/ExtAuthForm";
import BookmarkForm from "./components/bookmarkForm/BookmarkForm";

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

  useEffect(() => {
    if (sessionToken !== null && sessionToken !== "") {
      const fetchServerSession = async () => {
        const serverSession = await getServerSession(sessionToken);

        if (serverSession !== null) {
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
    if (sessionRecord !== null) {
      const isSessionExpired = sessionRecord?.expires < Date.now();
      setIsAuthenticated(!isSessionExpired);
      localStorage.setItem("isAuthenticated", (!isSessionExpired).toString());
    }
  }, [sessionRecord]);

  return (
    <div className="bg-zinc-800 font-sans text-sm text-gray-400">
      {isAuthenticated ? <BookmarkForm /> : <ExtAuthForm />}
    </div>
  );
};

export default App;
