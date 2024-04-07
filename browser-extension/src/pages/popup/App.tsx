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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchSessionToken = async () => {
      const sessionToken = await getSessionTokenFromCookie();
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
        }
      };
      fetchServerSession();
    }
  }, [sessionToken]);

  useEffect(() => {
    if (sessionRecord !== null) {
      const isSessionExpired = sessionRecord?.expires < Date.now();
      setIsAuthenticated(!isSessionExpired);
    }
  }, [sessionRecord]);

  return (
    <div className=" bg-zinc-800">
      {/* PLACEHOLDER for Login / Bookmark components */}
      {/* {JSON.stringify(sessionRecord)} */}
      {isAuthenticated ? <BookmarkForm /> : <ExtAuthForm />}
    </div>
  );
};

export default App;
