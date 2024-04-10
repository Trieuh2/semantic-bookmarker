import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import TextArea from "./TextArea";
import Input from "./Input";
import createOrUpdateBookmark from "../../../actions/apiActions/createOrUpdateBookmark";
import getBookmarkRecord from "../../../actions/apiActions/getBookmarkRecord";
import signOut from "../../../actions/apiActions/signOut";

interface BookmarkFormProps {
  sessionRecord: SessionRecord | null;
  parentOnSignOut: () => void;
}

interface SessionRecord {
  id: string;
  userId: string;
  expires: number;
  sessionToken: string;
}

interface ChromeTab {
  title?: string;
  url?: string;
}

interface BookmarkRecord {
  title: string;
  page_url: string;
  note: string;
  excerpt: string;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({
  sessionRecord,
  parentOnSignOut,
}) => {
  const [currentTab, setCurrentTab] = useState<ChromeTab | null>(null);
  const [bookmarkRecord, setBookmarkRecord] = useState<BookmarkRecord | null>(
    null
  );
  const [initialFetchAttempted, setInitialFetchAttempted] =
    useState<boolean>(false);

  // Parse the page for initial information
  useEffect(() => {
    if (sessionRecord) {
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
    }
  }, [sessionRecord]);

  // Fetch bookmark from DB on popup
  useEffect(() => {
    if (!bookmarkRecord && !initialFetchAttempted && currentTab) {
      const fetchBookmarkRecord = async () => {
        const sessionToken = sessionRecord?.sessionToken ?? "";
        const userId = sessionRecord?.userId ?? "";
        const page_url = currentTab?.url ?? "";

        const response = await getBookmarkRecord(
          sessionToken,
          userId,
          page_url
        );

        if (response) {
          setBookmarkRecord(response);
        }

        setInitialFetchAttempted(true);
      };
      fetchBookmarkRecord();
    }
  }, [currentTab]);

  // If this bookmark record has never been recorded, then record this bookmark
  useEffect(() => {
    if (!bookmarkRecord && initialFetchAttempted && currentTab) {
      const createBookmarkRecord = async () => {
        const title = currentTab?.title ?? "";
        const page_url = currentTab?.url ?? "";
        const note = "";
        const excerpt = "";
        const userId = sessionRecord?.userId ?? "";
        const sessionToken = sessionRecord?.sessionToken ?? "";

        const bookmark = await createOrUpdateBookmark(
          title,
          page_url,
          note,
          excerpt,
          userId,
          sessionToken
        );

        if (bookmark) {
          setBookmarkRecord(bookmark);
        } else {
        }
      };
      createBookmarkRecord();
    }
  }, [initialFetchAttempted]);

  const handleRedirectToWebsite = () => {
    chrome.tabs.create({
      url: "http://localhost:3000/",
    });
  };

  const handleSignOut = () => {
    const performSignOut = async () => {
      const sessionToken = sessionRecord?.sessionToken ?? "";
      await signOut(sessionToken);
      parentOnSignOut();
    };
    performSignOut();
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
            onMouseUp={handleSignOut}
          >
            Log out
          </button>
        </div>

        {/* Title */}
        <div className="w-full p-1 flex">
          <div className="min-w-20 p-2 text-end">Title</div>
          <div className="w-full h-full font-bold text-sm">
            <TextArea
              initialText={bookmarkRecord?.title ? bookmarkRecord.title : ""}
              useUnderline
            />
          </div>
        </div>

        {/* Note */}
        <div className="w-full p-1 flex">
          <div className="min-w-20 p-2 text-end">Note</div>
          <TextArea
            initialText={bookmarkRecord?.note ? bookmarkRecord.note : ""}
            useBackground
          />
        </div>

        {/* Collection */}
        <div className="w-full p-1 flex">
          <div className="min-w-20 p-2 text-end">Collection</div>
          <TextArea useBackground />
        </div>

        {/* Tags */}
        <div className="w-full p-1 flex">
          <div className="min-w-20 p-2 text-end">Tags</div>
          {/* <EditableLabel labelBackground /> */}
          <Input id="tags"></Input>
        </div>

        {/* URL */}
        <div className="w-full p-1 flex">
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
