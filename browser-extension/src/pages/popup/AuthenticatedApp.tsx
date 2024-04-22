import React from "react";
import { useSession } from "../../context/SessionContext";
import BookmarkForm from "./components/bookmarkForm/BookmarkForm";
import AuthForm from "./components/authForm/AuthForm";

const AuthenticatedApp: React.FC = () => {
  const session = useSession();

  return (
    <div>
      {session.isAuthenticated ? (
        <BookmarkForm sessionRecord={session.sessionRecord} />
      ) : (
        <AuthForm />
      )}
    </div>
  );
};

export default AuthenticatedApp;
