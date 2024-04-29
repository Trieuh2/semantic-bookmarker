import React from "react";
import { useSession } from "../../context/SessionContext";
import BookmarkForm from "./components/bookmarkForm/BookmarkForm";
import AuthForm from "./components/authForm/AuthForm";
import { BookmarkProvider } from "../../context/BookmarkContext";

const AuthenticatedApp: React.FC = () => {
  const session = useSession();

  return (
    <div>
      {session.isAuthenticated ? (
        <BookmarkProvider>
          <BookmarkForm />
        </BookmarkProvider>
      ) : (
        <AuthForm />
      )}
    </div>
  );
};

export default AuthenticatedApp;
