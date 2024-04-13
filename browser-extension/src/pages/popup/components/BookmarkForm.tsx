import React, { useEffect, useMemo, useState } from "react";
import Footer from "./Footer";
import TextArea from "./TextArea";
import Input from "./Input";
import getBookmark from "../../../actions/apiActions/getBookmark";
import signOut from "../../../actions/apiActions/signOut";
import createBookmark from "../../../actions/apiActions/createBookmark";

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
  createdAt: string | null;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({
  sessionRecord,
  parentOnSignOut,
}) => {
  const [currentTab, setCurrentTab] = useState<ChromeTab | null>(null);
  const [bookmarkRecord, setBookmarkRecord] = useState<BookmarkRecord | null>(
    null
  );
  const [title, setTitle] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [page_url, setPageUrl] = useState<string>("");

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

        const response = await getBookmark(sessionToken, userId, page_url);

        if (response) {
          setBookmarkRecord(response);
          setTitle(response.title);
          setNote(response.note);
          setPageUrl(response.page_url);
        }

        setInitialFetchAttempted(true);
      };
      fetchBookmarkRecord();
    }
  }, [currentTab]);

  // If this Bookmark record does not exist in the DB, create this record.
  useEffect(() => {
    if (!bookmarkRecord && initialFetchAttempted && currentTab) {
      const createBookmarkRecord = async () => {
        const title = currentTab?.title ?? "";
        const page_url = currentTab?.url ?? "";
        const note = "";
        const excerpt = "";
        const userId = sessionRecord?.userId ?? "";
        const sessionToken = sessionRecord?.sessionToken ?? "";

        const bookmarkCreateRequest = {
          title: title,
          page_url: page_url,
          note: note,
          excerpt: excerpt,
          userId: userId,
          sessionToken: sessionToken
        }

        const bookmark = await createBookmark(bookmarkCreateRequest);

        if (bookmark) {
          setBookmarkRecord(bookmark);
          setTitle(bookmark.title);
          setNote(bookmark.note);
          setPageUrl(bookmark.page_url);
        }
      };
      createBookmarkRecord();
    }
  }, [initialFetchAttempted]);

  const initialTitle = useMemo(
    () => bookmarkRecord?.title ?? "",
    [bookmarkRecord]
  );

  const handleResetTitle = () => {
    if (!title) {
      setTitle(initialTitle);
    }
  };

  const initialNote = useMemo(
    () => bookmarkRecord?.note ?? "",
    [bookmarkRecord]
  );

  const handleResetNote = () => {
    if (!note) {
      setNote(initialNote);
    }
  };

  const initialPageUrl = useMemo(
    () => bookmarkRecord?.page_url ?? "",
    [bookmarkRecord]
  );

  const handleResetPageUrl = () => {
    if (!page_url) {
      setPageUrl(initialPageUrl);
    }
  };

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

  const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    let hour = dateObj.getHours();
    const mins = ("0" + dateObj.getMinutes()).slice(-2); // Ensure two digit mins]

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12 for 12 AM

    return `${month}/${day}/${year} ${hour}:${mins} ${ampm}`;
  };

  return (
    <div
      className="
        w-[400px]
        flex
        flex-col
        items-start
        text-start
        bg-zinc-800
      "
    >
      {/* Header icon and Logout Button */}
      <div className="w-full p-2 flex justify-between bg-zinc-800">
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
      <div className="w-full p-1 flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Title</div>
        <div className="w-full h-full font-bold text-sm bg-zinc-800">
          <TextArea
            value={title}
            useUnderline
            onTextChange={(value) => {
              setTitle(value);
            }}
            onBlur={handleResetTitle}
          />
        </div>
      </div>

      {/* Note */}
      <div className="w-full p-1 flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Note</div>
        <TextArea
          value={note}
          useBackground
          onTextChange={(value) => {
            setNote(value);
          }}
          onBlur={handleResetNote}
        />
      </div>

      {/* Collection */}
      <div className="w-full p-1 flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Collection</div>
        <TextArea useBackground onTextChange={() => {}} onBlur={() => {}} />
      </div>

      {/* Tags */}
      <div className="w-full p-1 flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Tags</div>
        <Input id="tags"></Input>
      </div>

      {/* URL */}
      <div className="w-full p-1 flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">URL</div>
        <TextArea
          value={page_url}
          useBackground
          onTextChange={(value) => {
            setPageUrl(value);
          }}
          onBlur={handleResetPageUrl}
        />
      </div>

      {/* Created At */}
      {bookmarkRecord?.createdAt && (
        <div className="w-full py-2 px-4 flex bg-zinc-800">
          <div className="min-w-20 bg-zinc-800" />
          Saved {formatDate(bookmarkRecord?.createdAt)}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default BookmarkForm;
