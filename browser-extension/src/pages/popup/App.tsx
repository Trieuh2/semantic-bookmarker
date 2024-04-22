import React from "react";

import { SessionProvider } from "../../context/SessionContext";
import AuthenticatedApp from "./AuthenticatedApp";

const App: React.FC = () => {
  return (
    <SessionProvider>
      <div className="bg-zinc-800 font-sans text-sm text-gray-400">
        <AuthenticatedApp></AuthenticatedApp>
      </div>
    </SessionProvider>
  );
};

export default App;
