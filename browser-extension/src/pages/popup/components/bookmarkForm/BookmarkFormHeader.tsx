import React from "react";
import { useSession } from "../../../../context/SessionContext";

const BookmarkFormHeader: React.FC = () => {
  const { handleSignOut } = useSession();

  const handleRedirectToWebsite = () => {
    chrome.tabs.create({
      url: "http://localhost:3000/",
    });
  };

  const websiteRedirectBtnClasses = `
    p-2
    m-2
    hover:bg-zinc-700
    rounded-md
    transition-colors
    duration-150`;

  const labelClasses = `
    font-bold
    font-sans
    text-lg
    text-white
    text-center
  `;

  const signOutBtnClasses = `
    p-2
    m-2
    font-bold
    font-sans
    text-lg
    text-white
    hover:bg-zinc-700
    rounded-md
    transition-colors
    duration-150`;

  return (
    <>
      <div className="w-full flex justify-between bg-zinc-800">
        <div className="flex items-center">
          <button
            className={websiteRedirectBtnClasses}
            onMouseUp={handleRedirectToWebsite}
          >
            <img
              src={chrome.runtime.getURL("assets/icons/64.png")}
              alt="App logo"
              width="24"
              height="24"
            />
          </button>
          <span className={labelClasses}>Edit</span>
        </div>
        <button className={signOutBtnClasses} onMouseUp={handleSignOut}>
          Log out
        </button>
      </div>
    </>
  );
};

export default BookmarkFormHeader;
