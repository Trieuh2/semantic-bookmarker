import React from "react";
import SignInButton from "./SignInButton";
import Footer from "../Footer";

const AuthForm: React.FC = () => {
  return (
    <div
      className="
      w-[350px]
      h-[200px]
      flex
      flex-col
      justify-between
    "
    >
      <div
        className="
          w-full
          flex
          flex-1
          flex-col
          justify-center
          items-center
          text-center
          gap-2
        "
      >
        <h2 className="text-xl font-bold text-white">
          Please log in to start!
        </h2>
        <SignInButton>Sign In</SignInButton>
      </div>

      <Footer />
    </div>
  );
};

export default AuthForm;
