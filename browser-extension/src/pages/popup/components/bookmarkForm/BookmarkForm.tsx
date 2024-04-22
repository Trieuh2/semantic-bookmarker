import React, { useEffect, useState } from "react";
import Footer from "../Footer";
import TextArea from "./TextArea";
import Input from "./Input";
import TagButton from "./TagButton";
import CollectionMenu from "./collectionMenu/CollectionMenu";
import {
  fetchBookmark,
  addBookmark,
} from "../../../../actions/bookmarkActions";
import { fetchCollections } from "../../../../actions/collectionActions";
import {
  Bookmark,
  Collection,
  Session,
  TagToBookmark,
} from "../../../../types";
import { signOut } from "../../../../actions/sessionActions";
import RemoveBookmarkButton from "./RemoveBookmarkButton";
import BookmarkFormHeader from "./BookmarkFormHeader";

interface BookmarkFormProps {
  sessionRecord: Session | null;
  parentOnSignOut: () => void;
}

interface ChromeTab {
  title?: string;
  url?: string;
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
  const [bookmarkRecord, setBookmarkRecord] = useState<Bookmark | null>(null);
  const [initialValues, setInitialValues] = useState<Bookmark | null>(null);
  const [textAreaValues, setTextAreaValues] = useState<BookmarkTextAreas>({
    title: "",
    note: "",
    page_url: "",
  });

  const [selectedCollection, setCollectionName] = useState<string>("Unsorted");
  const [collectionOptions, setCollectionOptions] = useState<Set<string>>(
    new Set(["Unsorted"])
  );

  const [tagSet, setTagSet] = useState<Set<string>>(new Set());
  const [tagField, setTagField] = useState<string>("");

  const [initialFetchAttempted, setInitialFetchAttempted] =
    useState<boolean>(false);

  // Parse the page to preload popup fields and gather information for DB queries
  useEffect(() => {
    if (sessionRecord) {
      const fetchCurrentTab = async () => {
        let queryOptions = { active: true, lastFocusedWindow: true };
        try {
          const activeTab = (await chrome.tabs.query(queryOptions))[0];
          setCurrentTab(activeTab);
          setTextAreaValues({
            title: activeTab?.title ?? "",
            page_url: activeTab?.url ?? "",
            note: "",
          });
        } catch (error) {
          console.log(
            "Semantic Bookmarker: Error parsing page information.",
            error
          );
        }
      };
      fetchCurrentTab();
    }
  }, [sessionRecord]);

  // Fetch Bookmark data from DB on popup
  useEffect(() => {
    if (!bookmarkRecord && !initialFetchAttempted && currentTab) {
      const fetchBookmarkRecord = async () => {
        const userId = sessionRecord?.userId ?? "";
        const sessionToken = sessionRecord?.sessionToken ?? "";
        const page_url = currentTab?.url ?? "";

        const bookmark = await fetchBookmark(userId, sessionToken, page_url);

        if (bookmark) {
          setBookmarkRecord(bookmark);
          setTextAreaValues({
            title: bookmark.title,
            note: bookmark.note,
            page_url: bookmark.page_url,
          });

          setCollectionName(bookmark?.collection_name ?? "Unsorted");

          const initialTags = bookmark.tagToBookmarks
            .map((record: TagToBookmark) => record.tag_name)
            .filter((tag_name: string) => tag_name !== "");
          setTagSet(new Set(initialTags));
        }

        setInitialFetchAttempted(true);
      };
      fetchBookmarkRecord();
    }
  }, [currentTab]);

  // Fetch collection options
  useEffect(() => {
    if (sessionRecord) {
      const fetchCollectionOptions = async () => {
        try {
          const response = await fetchCollections(
            sessionRecord.userId,
            sessionRecord.sessionToken
          );

          if (response) {
            const collectionNames = response
              .map((collection: Collection) => collection.name)
              .filter((collectionName: string) => collectionName !== "");

            setCollectionOptions(new Set(collectionNames));
          }
        } catch (error) {
          console.log(
            "Error encountered during collections fetch attempt.",
            error
          );
        }
      };

      fetchCollectionOptions();
    }
  }, [sessionRecord]);

  // If this Bookmark record does not exist in the DB, this side effect will create the record.
  useEffect(() => {
    if (!bookmarkRecord && initialFetchAttempted && currentTab) {
      const createBookmarkRecord = async () => {
        const userId = sessionRecord?.userId ?? "";
        const sessionToken = sessionRecord?.sessionToken ?? "";
        const title = currentTab?.title ?? "";
        const page_url = currentTab?.url ?? "";
        const note = "";
        const excerpt = "";
        const collection_name = "Unsorted";

        const bookmarkCreateRequest = {
          userId: userId,
          sessionToken: sessionToken,
          title: title,
          page_url: page_url,
          note: note,
          excerpt: excerpt,
          collection_name: collection_name,
        };

        const newBookmark = await addBookmark(bookmarkCreateRequest);

        if (newBookmark) {
          setBookmarkRecord(newBookmark);
          setTextAreaValues({
            title: newBookmark.title,
            note: newBookmark.note,
            page_url: newBookmark.page_url,
          });
        }
      };
      createBookmarkRecord();
    }
  }, [initialFetchAttempted]);

  // TODO: Handle updates to 'excerpt' field
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
          sessionToken: sessionRecord?.sessionToken,
          id: bookmarkRecord?.id,
          title: textAreaValues.title,
          note: textAreaValues.note,
          collection_name: selectedCollection,
          tags: Array.from(tagSet),
          page_url: textAreaValues.page_url,
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
  }, [textAreaValues, tagSet, selectedCollection]);

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

  const handleRemoveBookmark = () => {
    if (bookmarkRecord && sessionRecord) {
      const performDeletion = async () => {
        // Remove this bookmark from DB
        const deleteRequest = {
          userId: sessionRecord?.userId ?? "",
          sessionToken: sessionRecord?.sessionToken ?? "",
          id: bookmarkRecord?.id ?? "",
        };
        chrome.runtime.sendMessage({
          action: "deleteBookmark",
          data: deleteRequest,
        });
      };
      performDeletion();

      // Close popup window
      window.close();
    }
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
        gap-1.5
      "
    >
      {/* Header icon and Logout Button */}
      <BookmarkFormHeader />

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
        <CollectionMenu
          collectionOptions={collectionOptions}
          selectedCollection={selectedCollection}
          setCollectionName={(value) => setCollectionName(value)}
        />
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
              {Array.from(tagSet).map((tagName, index) => {
                return (
                  <TagButton
                    key={index}
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
      <div className="w-full py-2 px-4 flex bg-zinc-800">
        <div className="min-w-20 h-full flex-none bg-zinc-800" />
        <div className="w-full h-full flex-none bg-zinc-800">
          {bookmarkRecord ? (
            "Saved " + formatDate(bookmarkRecord?.createdAt ?? "")
          ) : (
            <>&nbsp;</>
          )}
        </div>
      </div>

      {/* Remove Bookmark Button */}
      <div className="w-full px-4 flex justify-end bg-zinc-800">
        <RemoveBookmarkButton onClick={handleRemoveBookmark} />
      </div>

      <Footer />
    </div>
  );
};

export default BookmarkForm;