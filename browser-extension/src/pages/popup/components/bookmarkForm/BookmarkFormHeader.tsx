import React from "react";
import { useSession } from "../../../../context/SessionContext";

const BookmarkFormHeader: React.FC = () => {
  const { handleSignOut } = useSession();

  const handleRedirectToWebsite = () => {
    chrome.tabs.create({
      url: "http://localhost:3000/",
    });
  };

  return (
    <>
      <div className="w-full flex justify-between bg-zinc-800">
        <button
          className="
            p-2
            m-2
            hover:bg-zinc-700
            rounded-md
            transition-colors
            duration-150"
          onMouseUp={handleRedirectToWebsite}
        >
          <img
            src={chrome.runtime.getURL("assets/icons/64.png")}
            alt="App logo"
            width="24"
            height="24"
          />
        </button>
        <button
          className="
            p-2
            m-2
            text-lg
            font-bold
          text-white
            hover:bg-zinc-700
            rounded-md
            transition-colors
            duration-150"
          onMouseUp={handleSignOut}
        >
          Log out
        </button>
      </div>
    </>
  );
};

export default BookmarkFormHeader;
