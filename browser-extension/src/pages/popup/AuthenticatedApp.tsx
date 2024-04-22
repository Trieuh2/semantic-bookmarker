import React from "react";
import { useSession } from "../../context/SessionContext";
import BookmarkForm from "./components/bookmarkForm/BookmarkForm";
import AuthForm from "./components/authForm/AuthForm";

const AuthenticatedApp: React.FC = () => {
  const session = useSession();

  return (
    <div>
      {session.isAuthenticated ? (
        <BookmarkForm
          key={session.isAuthenticated.toString()}
          sessionRecord={session.sessionRecord}
          parentOnSignOut={session.handleSignOut}
        />
      ) : (
        <AuthForm />
      )}
    </div>
  );
};

export default AuthenticatedApp;
