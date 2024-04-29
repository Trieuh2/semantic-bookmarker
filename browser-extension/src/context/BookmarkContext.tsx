import React, { useCallback, useEffect, useReducer, useState } from "react";
import { createContext, useContext } from "react";
import { Bookmark, ChromeTab, Collection, Tag } from "../types";
import { addBookmark, fetchBookmark } from "../actions/bookmarkActions";
import { fetchCollections } from "../actions/collectionActions";
import { useSession } from "./SessionContext";

interface BookmarkState {
  bookmarkServerRecord: Bookmark | null;
  sessionToken: string;
  initialValues: Bookmark | null;
  title: string;
  note: string;
  page_url: string;
  selectedCollection: string;
  collectionOptions: Set<string>;
  tagFieldValue: string;
  tagSet: Set<string>;
}

// Define actions
type Action =
  | {
      type: "SET_STATE";
      variable:
        | "bookmarkServerRecord"
        | "sessionToken"
        | "initialValues"
        | "title"
        | "note"
        | "page_url"
        | "selectedCollection"
        | "collectionOptions"
        | "tagFieldValue"
        | "tagSet";
      payload: Bookmark | Tag[] | string | Set<string> | string[] | null;
    }
  | {
      type: "SET_TEXTAREA_STATES";
      payload: {
        title: string;
        note: string;
        page_url: string;
      };
    };

interface BookmarkContextType {
  state: BookmarkState;
  dispatch: React.Dispatch<Action>;
  deleteBookmark: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

const initialState = {
  bookmarkServerRecord: null,
  sessionToken: "",
  initialValues: null,
  title: "",
  note: "",
  page_url: "",
  selectedCollection: "Unsorted",
  collectionOptions: new Set([]),
  tagFieldValue: "",
  tagSet: new Set([]),
};

function bookmarkReducer(state: BookmarkState, action: Action): BookmarkState {
  switch (action.type) {
    case "SET_STATE":
      return {
        ...state,
        [action.variable as
          | "bookmarkServerRecord"
          | "initialValues"
          | "title"
          | "note"
          | "page_url"
          | "selectedCollection"
          | "collectionOptions"
          | "tagFieldValue"
          | "tagSet"]: action.payload,
      };
    case "SET_TEXTAREA_STATES":
      const { title, note, page_url } = action.payload;
      return {
        ...state,
        title,
        note,
        page_url,
      };
    default:
      return state;
  }
}

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);
  const [currentTab, setCurrentTab] = useState<ChromeTab | null>(null);
  const [initialFetchAttempted, setInitialFetchAttempted] =
    useState<boolean>(false);
  const { sessionRecord } = useSession();

  // Side effect to parse the page to preload popup fields and gather information for DB queries
  useEffect(() => {
    if (sessionRecord) {
      dispatch({
        type: "SET_STATE",
        variable: "sessionToken",
        payload: sessionRecord?.sessionToken,
      });

      const fetchCurrentTab = async () => {
        let queryOptions = { active: true, lastFocusedWindow: true };
        try {
          const activeTab = (await chrome.tabs.query(queryOptions))[0];
          setCurrentTab(activeTab);

          // set text area states
          dispatch({
            type: "SET_TEXTAREA_STATES",
            payload: {
              title: activeTab?.title ?? "",
              page_url: activeTab?.url ?? "",
              note: "",
            },
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
    if (
      !state.bookmarkServerRecord &&
      !initialFetchAttempted &&
      currentTab &&
      state.sessionToken
    ) {
      const fetchBookmarkRecord = async () => {
        const page_url = currentTab?.url ?? "";
        const bookmark = await fetchBookmark(state.sessionToken, page_url);

        if (bookmark) {
          // set bookmark record
          dispatch({
            type: "SET_STATE",
            variable: "bookmarkServerRecord",
            payload: bookmark,
          });

          // set text area values
          dispatch({
            type: "SET_TEXTAREA_STATES",
            payload: {
              title: bookmark.title,
              note: bookmark.note,
              page_url: bookmark.page_url,
            },
          });

          // set collection name
          dispatch({
            type: "SET_STATE",
            variable: "selectedCollection",
            payload: bookmark?.collection?.name ?? "Unsorted",
          });

          // set tag set
          const initialTags =
            bookmark.tagToBookmarks
              ?.map((tagToBookmark) => tagToBookmark.tag?.name)
              .filter((tag_name) => tag_name) || [];
          dispatch({
            type: "SET_STATE",
            variable: "tagSet",
            payload: new Set(initialTags),
          });
        }

        setInitialFetchAttempted(true);
      };
      fetchBookmarkRecord();
    }
  }, [currentTab, state.sessionToken]);

  // Fetch collection options
  useEffect(() => {
    if (state.sessionToken) {
      const fetchCollectionOptions = async () => {
        try {
          const response = await fetchCollections(state.sessionToken);

          if (response) {
            const collectionNames = response
              .map((collection: Collection) => collection.name)
              .filter((collectionName: string) => collectionName !== "");

            // set collection options
            dispatch({
              type: "SET_STATE",
              variable: "collectionOptions",
              payload: new Set(collectionNames),
            });
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
  }, [state.sessionToken]);

  // If this Bookmark record does not exist in the DB, this side effect will create the record.
  useEffect(() => {
    if (
      !state.bookmarkServerRecord &&
      initialFetchAttempted &&
      currentTab &&
      state.sessionToken
    ) {
      const createBookmarkRecord = async () => {
        const bookmarkCreateRequest = {
          sessionToken: state.sessionToken,
          title: currentTab?.title ?? "",
          page_url: currentTab?.url ?? "",
          note: "",
          excerpt: "",
          collection_name: "Unsorted",
        };

        const newBookmark = await addBookmark(bookmarkCreateRequest);

        if (newBookmark) {
          // set bookmark record
          dispatch({
            type: "SET_STATE",
            variable: "bookmarkServerRecord",
            payload: newBookmark,
          });

          // set text area values
          dispatch({
            type: "SET_TEXTAREA_STATES",
            payload: {
              title: newBookmark.title,
              note: newBookmark.note,
              page_url: newBookmark.page_url,
            },
          });
        }
      };
      createBookmarkRecord();
    }
  }, [initialFetchAttempted, state.sessionToken]);

  // TODO: Handle updates to 'excerpt' field
  // Side effect to send a message to background service worker for updating the Bookmark record data
  useEffect(() => {
    const haveRequiredFields = () => {
      return (
        state.title &&
        state.page_url &&
        state.bookmarkServerRecord?.id &&
        state.sessionToken != ""
      );
    };

    const performUpdate = () => {
      if (haveRequiredFields() && state.initialValues) {
        const updatePayload = {
          sessionToken: state.sessionToken,
          id: state.bookmarkServerRecord?.id,
          title: state.title,
          note: state.note,
          collection_name: state.selectedCollection,
          tags: Array.from(state.tagSet),
          page_url: state.page_url,
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
  }, [
    state.title,
    state.page_url,
    state.note,
    state.tagSet,
    state.selectedCollection,
    state.sessionToken,
  ]);

  // Store initial values
  useEffect(() => {
    if (!state.initialValues && state.bookmarkServerRecord) {
      dispatch({
        type: "SET_STATE",
        variable: "initialValues",
        payload: state.bookmarkServerRecord,
      });
    }
  }, [state.bookmarkServerRecord, state.initialValues]);

  const deleteBookmark = useCallback(() => {
    if (state.bookmarkServerRecord && state.sessionToken) {
      const performDeletion = async () => {
        // Remove this bookmark from DB
        const deleteRequest = {
          sessionToken: state.sessionToken ?? "",
          id: state.bookmarkServerRecord?.id ?? "",
        };
        await chrome.runtime.sendMessage({
          action: "deleteBookmark",
          data: deleteRequest,
        });
      };
      performDeletion();
    }
  }, [state.bookmarkServerRecord]);

  const value = { state, dispatch, deleteBookmark };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};
