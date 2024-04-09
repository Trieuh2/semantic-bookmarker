import React, { useEffect, useState } from "react";
import Footer from "../Footer";
import TextArea from "../TextArea";
import Input from "../Input";

interface ChromeTab {
  title?: string;
  url?: string;
}

const BookmarkForm: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ChromeTab | null>(null);

  useEffect(() => {
    const fetchCurrentTab = async () => {
      let queryOptions = { active: true, lastFocusedWindow: true };
      try {
        const tabs = await chrome.tabs.query(queryOptions);
        setCurrentTab(tabs[0]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentTab();
  }, []);

  const handleRedirectToWebsite = () => {
    chrome.tabs.create({
      url: "http://localhost:3000/",
    });
  };

  return (
    <div>
      <div
        className="
        w-[400px]
        h-[400px]
        flex
        flex-col
        gap-2
        p-2
        items-start
        text-start
      "
      >
        {/* Header icon and Logout Button */}
        <div className="w-full flex justify-between">
          <button
            className="
            p-2
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
            text-lg
            font-bold
          text-white
            hover:bg-zinc-700
            rounded-md
            transition-colors
            duration-150"
            onMouseUp={handleRedirectToWebsite}
          >
            Log out
          </button>
        </div>

        {/* Title */}
        <div className="w-full flex">
          <div className="min-w-20 p-2 text-end">Title</div>
          <div className="w-full h-full font-bold text-sm">
            <TextArea
              initialText={currentTab?.title ? currentTab.title : ""}
              useUnderline
            />
          </div>
        </div>

        {/* Note */}
        <div className="w-full flex">
          <div className="min-w-20 p-2 text-end">Note</div>
          <TextArea useBackground />
        </div>

        {/* Collection */}
        <div className="w-full flex">
          <div className="min-w-20 p-2 text-end">Collection</div>
          <TextArea useBackground />
        </div>

        {/* Tags */}
        <div className="w-full flex">
          <div className="min-w-20 p-2 text-end">Tags</div>
          {/* <EditableLabel labelBackground /> */}
          <Input id="tags"></Input>
        </div>

        {/* URL */}
        <div className="w-full flex">
          <div className="min-w-20 p-2 text-end">URL</div>
          <TextArea
            initialText={currentTab?.url ? currentTab.url : ""}
            useBackground
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookmarkForm;
