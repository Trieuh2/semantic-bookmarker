import React from "react";

const Footer: React.FC = () => {
  const gitHubLabel = "<\\> GitHub";
  const handleOnClick = () => {
    chrome.tabs.create({
      url: "https://github.com/Trieuh2/semantic-bookmarker",
    });
  };

  return (
    <div className="w-full text-right p-1 text-gray-600 font-bold font-mono">
      <button onClick={handleOnClick}>{gitHubLabel}</button>
    </div>
  );
};

export default Footer;
