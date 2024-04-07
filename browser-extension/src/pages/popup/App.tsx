import React, { useEffect, useState } from "react";
import getSessionTokenFromCookie from "../../actions/getSessionTokenFromCookie";
import getServerSession from "../../actions/getServerSession";

const App: React.FC = () => {
  const [sessionToken, setSessionToken] = useState<string | null>("");
  const [sessionRecord, setSessionRecord] = useState(null);

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

  return (
    <div className="w-[350px] h-[400px] bg-zinc-800 text-white">
      {/* PLACEHOLDER for Login / Bookmark components */}
      {JSON.stringify(sessionRecord)}
    </div>
  );
};

export default App;
