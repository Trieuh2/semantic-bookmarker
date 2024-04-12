import React from "react";

const Footer: React.FC = () => {
  const gitHubLabel = "<\\> GitHub";
  const handleOnClick = () => {
    chrome.tabs.create({
      url: "https://github.com/Trieuh2/semantic-bookmarker",
    });
  };

  return (
    <div className="w-full text-right py-2 px-4 text-gray-600 font-bold font-mono bg-zinc-800">
      <button onMouseUp={handleOnClick}>{gitHubLabel}</button>
    </div>
  );
};

export default Footer;
