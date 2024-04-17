import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import TextArea from "./TextArea";
import Input from "./Input";
import getBookmark from "../../../actions/apiActions/getBookmark";
import signOut from "../../../actions/apiActions/signOut";
import createBookmark from "../../../actions/apiActions/createBookmark";
import TagButton from "./TagButton";

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
  id: string;
  title: string;
  page_url: string;
  note: string;
  excerpt: string;
  createdAt: string | null;
}

interface BookmarkTextAreas {
  title: string;
  page_url: string;
  note: string;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({
  sessionRecord,
  parentOnSignOut,
}) => {
  const [currentTab, setCurrentTab] = useState<ChromeTab | null>(null);
  const [bookmarkRecord, setBookmarkRecord] = useState<BookmarkRecord | null>(
    null
  );
  const [initialValues, setInitialValues] = useState<BookmarkRecord | null>(
    null
  );
  const [textAreaValues, setTextAreaValues] = useState<BookmarkTextAreas>({
    title: "",
    note: "",
    page_url: "",
  });
  const [tagSet, setTagSet] = useState<Set<string>>(new Set());
  const [tagField, setTagField] = useState<string>("");

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
          setTextAreaValues({
            title: response.title,
            note: response.note,
            page_url: response.page_url,
          });
        }

        setInitialFetchAttempted(true);
      };
      fetchBookmarkRecord();
    }
  }, [currentTab]);

  // If this Bookmark record does not exist in the DB, this side effect will create the record.
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
          sessionToken: sessionToken,
        };

        const response = await createBookmark(bookmarkCreateRequest);

        if (response) {
          setBookmarkRecord(response);
          setTextAreaValues({
            title: response.title,
            note: response.note,
            page_url: response.page_url,
          });
        }
      };
      createBookmarkRecord();
    }
  }, [initialFetchAttempted]);

  // TODO: Handle updates to 'excerpt', 'tags', and 'collection' fields
  // Side effect to send a message to background service worker for updating the Bookmark record data
  useEffect(() => {
    const haveRequiredFields = () => {
      return (
        textAreaValues.title &&
        textAreaValues.page_url &&
        bookmarkRecord?.id &&
        sessionRecord?.sessionToken != ""
      );
    };

    const performUpdate = () => {
      if (haveRequiredFields() && initialValues) {
        const updatePayload = {
          id: bookmarkRecord?.id,
          sessionToken: sessionRecord?.sessionToken,
          title: textAreaValues.title,
          page_url: textAreaValues.page_url,
          note: textAreaValues.note,
          excerpt: "",
        };

        try {
          chrome.runtime.sendMessage({
            action: "updateBookmark",
            data: updatePayload,
          });
        } catch (error) {
          console.error(
            "Semantic Bookmarker: Error sending message to service worker",
            error
          );
        }
      }
    };

    performUpdate();
  }, [textAreaValues]);

  // Store initial values
  useEffect(() => {
    if (!initialValues && bookmarkRecord) {
      setInitialValues(bookmarkRecord);
    }
  }, [bookmarkRecord, initialValues]);

  // Handlers for input changes
  const handleTextAreaOnChange = (
    field: keyof BookmarkTextAreas,
    value: string
  ) => {
    setTextAreaValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextAreaOnBlur = (field: keyof BookmarkTextAreas) => {
    if (
      (field === "title" || field === "page_url") && // required fields
      !textAreaValues[field] &&
      initialValues
    ) {
      setTextAreaValues((prev) => ({
        ...prev,
        [field]: initialValues[field],
      }));
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
    const mins = ("0" + dateObj.getMinutes()).slice(-2); // Ensure two digit mins

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
        gap-2
      "
    >
      {/* Header icon and Logout Button */}
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

      {/* Title */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Title</div>
        <div className="w-full h-full font-bold text-sm bg-zinc-800">
          <TextArea
            value={textAreaValues.title}
            useUnderline
            onTextChange={(value) => {
              handleTextAreaOnChange("title", value);
            }}
            onBlur={() => handleTextAreaOnBlur("title")}
          />
        </div>
      </div>

      {/* Note */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Note</div>
        <TextArea
          value={textAreaValues.note}
          useBackground
          onTextChange={(value) => {
            handleTextAreaOnChange("note", value);
          }}
          onBlur={() => handleTextAreaOnBlur("note")}
        />
      </div>

      {/* Collection */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Collection</div>
        <TextArea useBackground onTextChange={() => {}} onBlur={() => {}} />
      </div>

      {/* Tags */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Tags</div>
        <div className="w-full flex flex-col mx-2">
          <Input
            id="tags"
            value={tagField}
            onChange={(event) => setTagField(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const newTag = tagField.trim();
                setTagSet(new Set([...tagSet, newTag]));
                setTagField("");
                event.preventDefault();
              }
            }}
          />

          {/* Tag buttons */}
          {tagSet && tagSet.size > 0 && (
            <div className="flex flex-wrap w-full gap-1 mt-2">
              {Array.from(tagSet).map((tagName) => {
                return (
                  <TagButton
                    name={tagName}
                    onClick={(name) => {
                      const updatedTagSet = new Set(tagSet);
                      updatedTagSet.delete(name);
                      setTagSet(updatedTagSet);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* URL */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">URL</div>
        <TextArea
          value={textAreaValues.page_url}
          useBackground
          onTextChange={(value) => {
            handleTextAreaOnChange("page_url", value);
          }}
          onBlur={() => handleTextAreaOnBlur("page_url")}
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
