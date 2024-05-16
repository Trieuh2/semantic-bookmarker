"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useAuth } from "./AuthContext";
import {
  CollectionWithBookmarkCount,
  FullBookmarkType,
  TagWithBookmarkCount,
} from "../types";
import { axiosFetchResource } from "../libs/resourceActions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { handleRerouting } from "../utils/routeHelper";
import { useSession } from "next-auth/react";
import { getUrlInfo } from "../utils/urlActions";

// State structure
interface BookmarkState {
  collections: CollectionWithBookmarkCount[];
  tags: TagWithBookmarkCount[];
  bookmarks: FullBookmarkType[];
  isBookmarksLoading: boolean;
  isShowingDetailedPanel: boolean;
  activeBookmark: FullBookmarkType | undefined | null;
}

// Define actions
type Action =
  | {
      type: "FILTER_RESOURCE";
      resource: "collection" | "tag" | "bookmark";
      identifier: string;
    }
  | {
      type: "UPDATE_UNIQUE_RESOURCE_METADATA";
      resource: "collection" | "tag" | "bookmark";
      identifierType: "name" | "id";
      identifier: string;
      payload:
        | CollectionWithBookmarkCount
        | TagWithBookmarkCount
        | FullBookmarkType
        | Record<string, any>;
    }
  | {
      type: "UPDATE_RESOURCE_NAME";
      resource: "collection" | "tag";
      identifier: string;
      name: string;
    }
  | {
      type: "SET_RESOURCES";
      resource: "collection" | "tag" | "bookmark";
      payload:
        | CollectionWithBookmarkCount[]
        | TagWithBookmarkCount[]
        | FullBookmarkType[];
    }
  | {
      type: "SET_BOOKMARKS_LOADING_STATE";
      payload: boolean;
    }
  | {
      type: "TOGGLE_DETAILED_PANEL_WITH_BOOKMARK";
      payload: {
        isShowing: boolean;
        activeBookmark: FullBookmarkType;
      };
    }
  | {
      type: "SHOW_DETAILED_PANEL_WITH_BOOKMARK";
      payload: {
        activeBookmark: FullBookmarkType;
      };
    };

interface BookmarkContextType {
  state: BookmarkState;
  dispatch: React.Dispatch<Action>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

const initialState = {
  collections: [],
  tags: [],
  bookmarks: [],
  isBookmarksLoading: true,
  isShowingDetailedPanel: false,
  activeBookmark: null,
};

function bookmarkReducer(state: BookmarkState, action: Action): BookmarkState {
  let resourceType;
  let updatedResources;
  let updatedCollections = state.collections;
  let updatedTags = state.tags;
  let updatedBookmarks = state.bookmarks;
  let updatedTagToBookmarks;
  let updatedActiveBookmark;
  let updatedIsShowingDetailedPanel = state.isShowingDetailedPanel;

  switch (action.type) {
    case "FILTER_RESOURCE":
      if (action.resource === "collection") {
        resourceType = "collections";
      } else if (action.resource === "tag") {
        resourceType = "tags";
      } else {
        resourceType = "bookmarks";
      }

      updatedResources = state[
        resourceType as "collections" | "tags" | "bookmarks"
      ].filter((item) => item.id !== action.identifier);

      // Update bookmarks to align with updated tags/collections resources
      if (resourceType === "collections" || resourceType === "tags") {
        updatedBookmarks = state.bookmarks.map((bookmark) => {
          // Update bookmarks to filter removed tag if necessary
          updatedTagToBookmarks =
            bookmark.tagToBookmarks && action.resource === "tag"
              ? bookmark.tagToBookmarks?.filter(
                  (ttb) => ttb.tag?.id !== action.identifier
                )
              : bookmark.tagToBookmarks;

          // If a collection belonging to a bookmark is deleted, set that bookmark's collection to 'Unsorted'
          let updatedCollection = bookmark.collection;
          if (
            action.resource === "collection" &&
            bookmark.collection?.id === action.identifier
          ) {
            const unsortedCollection = state.collections.find(
              (collection) => collection.name === "Unsorted"
            );
            updatedCollection = unsortedCollection;
          }

          return {
            ...bookmark,
            tagToBookmarks: updatedTagToBookmarks,
            collectionId: updatedCollection?.id ?? "",
            collection: updatedCollection,
          };
        });

        // Update active bookmark details with updated tag/collection data
        if (state.activeBookmark) {
          updatedActiveBookmark = updatedBookmarks.find(
            (bookmark) => bookmark.id === state.activeBookmark?.id
          );

          if (updatedActiveBookmark === undefined) {
            updatedActiveBookmark = state.activeBookmark;
          }
        } else {
          updatedActiveBookmark = state.activeBookmark;
        }
      }

      // If a bookmark is removed, set related states to filter this
      if (
        state.activeBookmark &&
        resourceType === "bookmarks" &&
        state.activeBookmark?.id === action.identifier
      ) {
        updatedActiveBookmark = undefined;
        updatedIsShowingDetailedPanel = false;
        updatedBookmarks = updatedResources as FullBookmarkType[];

        // TODO: Update collection and tag count for related bookmark
      }

      return {
        ...state,
        [resourceType]: updatedResources,
        bookmarks: updatedBookmarks,
        activeBookmark: updatedActiveBookmark,
        isShowingDetailedPanel: updatedIsShowingDetailedPanel,
      };
    case "UPDATE_UNIQUE_RESOURCE_METADATA":
      if (action.resource === "collection") {
        resourceType = "collections";
      } else if (action.resource === "tag") {
        resourceType = "tags";
      } else {
        resourceType = "bookmarks";
      }

      updatedResources = state[
        resourceType as "collections" | "tags" | "bookmarks"
      ].map((resource: any) => {
        if (action.identifierType === "name") {
          return resource.name === action.identifier
            ? { ...resource, ...action.payload }
            : resource;
        }
        if (action.identifierType === "id") {
          return resource.id === action.identifier
            ? { ...resource, ...action.payload }
            : resource;
        }
      });

      if (action.resource === "collection") {
        updatedCollections = updatedResources;
      } else if (action.resource === "tag") {
        updatedTags = updatedResources;
      } else {
        updatedBookmarks = updatedResources;
      }

      // Update collections data related to bookmarks' update
      if (
        (action.resource === "bookmark" && "collectionId" in action.payload) ||
        "collection" in action.payload
      ) {
        const prevBookmark = state.bookmarks.find(
          (bookmark) => bookmark.id === action.identifier
        );
        const prevCollectionId = prevBookmark?.collectionId;

        updatedCollections = state.collections.map((collection) => {
          // Decrement count of bookmarks for previous collection
          if (collection.id === prevCollectionId) {
            const updatedBookmarksCount = collection._count.bookmarks - 1;
            return {
              ...collection,
              _count: {
                bookmarks: updatedBookmarksCount,
              },
            };
          }
          // Increment count for new collection
          else if (
            "collectionId" in action.payload &&
            collection.id === action.payload.collectionId
          ) {
            const constUpdatedBookmarkCount = collection._count.bookmarks + 1;
            return {
              ...collection,
              _count: {
                bookmarks: constUpdatedBookmarkCount,
              },
            };
          } else {
            return collection;
          }
        });
      }

      // Update tags data related to bookmarks' update
      if (action.resource === "bookmark" && "") {
      }

      // Update active bookmark details if necessary
      if (
        action.resource === "bookmark" &&
        state.activeBookmark?.id === action.identifier
      ) {
        updatedActiveBookmark = updatedResources.find(
          (bookmark) => bookmark.id === state.activeBookmark?.id
        );

        if (updatedActiveBookmark === undefined) {
          updatedActiveBookmark = state.activeBookmark;
        }
      } else {
        updatedActiveBookmark = state.activeBookmark;
      }

      return {
        ...state,
        collections: updatedCollections,
        tags: updatedTags,
        bookmarks: updatedBookmarks,
        activeBookmark: updatedActiveBookmark,
      };
    case "UPDATE_RESOURCE_NAME":
      resourceType = action.resource === "collection" ? "collections" : "tags";
      updatedResources = state[resourceType as "collections" | "tags"].map(
        (resource) =>
          resource.id === action.identifier
            ? { ...resource, name: action.name }
            : resource
      );

      // Update bookmarks for nested tag or collection names
      updatedBookmarks = state.bookmarks.map((bookmark) => {
        // Update tags if necessary
        updatedTagToBookmarks = bookmark.tagToBookmarks?.map((ttb) => {
          if (ttb.tag?.id === action.identifier && action.resource === "tag") {
            return { ...ttb, tag: { ...ttb.tag, name: action.name } };
          }
          return ttb;
        });

        // Update collection if necessary
        let updatedCollection = bookmark.collection;
        if (
          bookmark.collection &&
          bookmark.collection.id === action.identifier &&
          action.resource === "collection"
        ) {
          updatedCollection = { ...bookmark.collection, name: action.name };
        }

        return {
          ...bookmark,
          tagToBookmarks: updatedTagToBookmarks,
          collection: updatedCollection,
        };
      });

      // Update active bookmark details if necessary
      if (state.activeBookmark) {
        updatedActiveBookmark = updatedBookmarks.find(
          (bookmark) => bookmark.id === state.activeBookmark?.id
        );
        if (updatedActiveBookmark === undefined) {
          updatedActiveBookmark = state.activeBookmark;
        }
      }

      return {
        ...state,
        [resourceType]: updatedResources,
        bookmarks: updatedBookmarks,
        activeBookmark: updatedActiveBookmark,
      };
    case "SET_RESOURCES":
      if (action.resource === "collection") {
        resourceType = "collections";
      } else if (action.resource === "tag") {
        resourceType = "tags";
      } else if (action.resource === "bookmark") {
        resourceType = "bookmarks";
      }
      return {
        ...state,
        [resourceType as "collections" | "tags" | "bookmarks"]: action.payload,
      };
    case "SET_BOOKMARKS_LOADING_STATE":
      return {
        ...state,
        isBookmarksLoading: action.payload,
      };
    case "TOGGLE_DETAILED_PANEL_WITH_BOOKMARK":
      return {
        ...state,
        isShowingDetailedPanel: action.payload.isShowing,
        activeBookmark: action.payload.activeBookmark,
      };
    case "SHOW_DETAILED_PANEL_WITH_BOOKMARK":
      return {
        ...state,
        isShowingDetailedPanel: true,
        activeBookmark: action.payload.activeBookmark,
      };
    default:
      return state;
  }
}

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);
  const { sessionToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const searchParams = useSearchParams();

  const fetchParameters = useMemo(() => {
    const urlInfo = getUrlInfo(pathname);
    const { directory, subdirectory, id } = urlInfo;

    let params = {} as Record<string, any>;
    const searchQuery = searchParams.get("q");

    if (directory === "collections" && id) {
      params["collectionId"] = id;
    } else if (directory === "tags" && id) {
      params["tagId"] = id;
    }

    if (subdirectory === "search" && searchQuery) {
      params["searchQuery"] = searchQuery;
    }

    return params;
  }, [pathname, searchParams]);

  // Fetch bookmarks as the page route changes
  useEffect(() => {
    const fetchBookmarks = async () => {
      dispatch({
        type: "SET_BOOKMARKS_LOADING_STATE",
        payload: true,
      });

      const bookmarks = await axiosFetchResource(
        "bookmark",
        sessionToken,
        fetchParameters
      );
      if (JSON.stringify(bookmarks) !== JSON.stringify(state.bookmarks)) {
        dispatch({
          type: "SET_RESOURCES",
          resource: "bookmark",
          payload: bookmarks,
        });
        dispatch({
          type: "SET_BOOKMARKS_LOADING_STATE",
          payload: false,
        });
      } else {
        dispatch({
          type: "SET_BOOKMARKS_LOADING_STATE",
          payload: false,
        });
      }
    };

    if (sessionToken) {
      fetchBookmarks();
    }
  }, [sessionToken, pathname, searchParams, fetchParameters]);

  // Fetch collection and tag data
  useEffect(() => {
    const fetchData = async (resourceType: "collection" | "tag") => {
      const fetchedData = await axiosFetchResource(resourceType, sessionToken);
      dispatch({
        type: "SET_RESOURCES",
        resource: resourceType,
        payload: fetchedData,
      });
    };

    if (sessionToken) {
      fetchData("collection");
      fetchData("tag");
    }
  }, [sessionToken]);

  // Handle routing validation
  useEffect(() => {
    if (session && !state.isBookmarksLoading) {
      handleRerouting(pathname, router, state.collections, state.tags, session);
    }
  }, [
    pathname,
    router,
    session,
    state.collections,
    state.tags,
    state.isBookmarksLoading,
  ]);

  const value = {
    state,
    dispatch,
  };

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
