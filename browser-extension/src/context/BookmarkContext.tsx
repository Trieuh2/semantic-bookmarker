import React, { useCallback, useEffect, useReducer, useState } from "react";
import { createContext, useContext } from "react";
import { Bookmark, ChromeTab, Collection, Tag } from "../types";
import { addBookmark, fetchBookmark } from "../actions/bookmarkActions";
import { fetchCollections } from "../actions/collectionActions";
import { useSession } from "./SessionContext";
import apiUploadFavIcon from "../actions/apiActions/imageAPI";

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
  currentTab: ChromeTab | null;
  favIconUrl: string;
  isLoading: boolean;
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
        | "tagSet"
        | "currentTab"
        | "favIconUrl"
        | "isLoading";
      payload:
        | Bookmark
        | Tag[]
        | string
        | Set<string>
        | string[]
        | ChromeTab
        | null
        | boolean;
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
  currentTab: null,
  favIconUrl: "",
  isLoading: true,
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
          | "tagSet"
          | "currentTab"
          | "favIconUrl"
          | "isLoading"]: action.payload,
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
  const [tabStatus, setTabStatus] = useState<string | undefined>("loading");
  const [initialFetchAttempted, setInitialFetchAttempted] =
    useState<boolean>(false);
  const { sessionRecord } = useSession();

  // Side effect to parse the page to preload popup fields and gather information for DB queries
  useEffect(() => {
    if (tabStatus === "loading") {
      // Ensures the current tab is loaded before trying to parse data
      const fetchTabStatus = async () => {
        let queryOptions = {
          active: true,
          lastFocusedWindow: true,
        };
        const activeTab = (await chrome.tabs.query(queryOptions))[0];
        setTabStatus(activeTab?.status);
      };
      fetchTabStatus();
    }

    if (sessionRecord && tabStatus === "complete") {
      dispatch({
        type: "SET_STATE",
        variable: "sessionToken",
        payload: sessionRecord?.sessionToken,
      });

      const fetchCurrentTab = async () => {
        let queryOptions = {
          active: true,
          lastFocusedWindow: true,
        };
        try {
          const activeTab = (await chrome.tabs.query(queryOptions))[0];
          // Set current tab
          dispatch({
            type: "SET_STATE",
            variable: "currentTab",
            payload: activeTab,
          });

          // Set text area states
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
  }, [sessionRecord, tabStatus]);

  // Fetch Bookmark data from DB on popup
  useEffect(() => {
    if (
      !state.bookmarkServerRecord &&
      !initialFetchAttempted &&
      state.currentTab &&
      state.sessionToken
    ) {
      const fetchBookmarkRecord = async () => {
        const page_url = state.currentTab?.url ?? "";
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
  }, [state.currentTab, state.sessionToken]);

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
      state.currentTab &&
      state.sessionToken
    ) {
      const createBookmarkRecord = async () => {
        const bookmarkCreateRequest = {
          sessionToken: state.sessionToken,
          title: state.currentTab?.title ?? "",
          page_url: state.currentTab?.url ?? "",
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

  // Side effect to upload favIcon image and set the state of the favIconUrl
  useEffect(() => {
    const uploadFavIcon = async () => {
      if (
        state.sessionToken &&
        state.currentTab?.favIconUrl &&
        state.bookmarkServerRecord
      ) {
        const getDomainName = (page_url: string) => {
          try {
            const url = new URL(page_url);
            const urlHostName = url.hostname;
            return urlHostName.replace("www.", "");
          } catch (error) {
            console.error("Error parsing hostName from page_url", error);
            return "";
          }
        };
        const domainName = getDomainName(state.page_url);

        const favIcon = await apiUploadFavIcon(
          state.sessionToken,
          state.currentTab.favIconUrl,
          "favIcon",
          domainName,
          state.bookmarkServerRecord.id
        );

        // Set the state for the favIconUrl
        dispatch({
          type: "SET_STATE",
          variable: "favIconUrl",
          payload: favIcon.data.url,
        });
      }
    };
    uploadFavIcon();
  }, [state.sessionToken, state.currentTab, state.bookmarkServerRecord]);

  // Side effect to mark loading complete
  useEffect(() => {
    if (
      state.bookmarkServerRecord &&
      state.initialValues &&
      initialFetchAttempted
    ) {
      dispatch({
        type: "SET_STATE",
        variable: "isLoading",
        payload: false,
      });
    }
  }, [state.bookmarkServerRecord, state.initialValues, initialFetchAttempted]);

  // Side effect to send a message to background service worker for updating the Bookmark record data
  useEffect(() => {
    if (state.bookmarkServerRecord && !state.isLoading) {
      const haveRequiredFields = () => {
        return (
          state.title &&
          state.page_url &&
          state.bookmarkServerRecord?.id &&
          state.sessionToken != ""
        );
      };

      const tagsHaveChanged = () => {
        const bookmarkServerTags =
          state.bookmarkServerRecord?.tagToBookmarks
            ?.map((tagToBookmark) => tagToBookmark.tag?.name)
            .filter((tag_name) => tag_name) || [];

        const newServerTags = Array.from(state.tagSet).filter((tagName) => {
          !bookmarkServerTags.includes(tagName);
        });

        return newServerTags.length !== 0;
      };

      const haveChangedValues = () => {
        return (
          state.title !== state.bookmarkServerRecord?.title ||
          state.note !== state.bookmarkServerRecord.note ||
          state.page_url !== state.bookmarkServerRecord.page_url ||
          state.selectedCollection !==
            state.bookmarkServerRecord.collection.name ||
          !tagsHaveChanged() ||
          state.favIconUrl !== state.bookmarkServerRecord.favIconUrl
        );
      };

      const performUpdate = async () => {
        const updatePayload = {
          sessionToken: state.sessionToken,
          id: state.bookmarkServerRecord?.id,
          title: state.title,
          note: state.note,
          collection_name: state.selectedCollection,
          tags: Array.from(state.tagSet),
          page_url: state.page_url,
          excerpt: "",
          favIconUrl: state.favIconUrl,
        };

        try {
          await chrome.runtime.sendMessage({
            action: "updateBookmark",
            data: updatePayload,
          });
        } catch (error) {
          console.error(
            "Semantic Bookmarker: Error sending message to service worker",
            error
          );
        }
      };
      if (haveRequiredFields() && state.initialValues && haveChangedValues()) {
        performUpdate();
      }
    }
  }, [
    state.title,
    state.page_url,
    state.note,
    state.tagSet,
    state.selectedCollection,
    state.sessionToken,
    state.favIconUrl,
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
