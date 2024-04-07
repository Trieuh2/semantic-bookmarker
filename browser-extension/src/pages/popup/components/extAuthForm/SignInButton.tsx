import React from "react";
import clsx from "clsx";

interface SignInButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
}

const SignInButton: React.FC<SignInButtonProps> = ({
  children,
  disabled,
}) => {
  const buttonClasses = clsx(
    `
    flex
    rounded-md
    justify-center
    px-2
    py-1
    w-8/12
    font-medium
    text-black
    text-base
    transition-colors
    duration-150
    `,
    disabled
      ? "opacity-50 cursor-default bg-zinc-900 outline-0"
      : "bg-orange-300 hover:bg-orange-200 active:bg-orange-400"
  );

  const handleSignIn = () => {
    chrome.tabs.create({ url: "http://localhost:3000/" });
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleSignIn}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default SignInButton;
