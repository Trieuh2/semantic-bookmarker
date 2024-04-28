"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useAuth } from "./AuthContext";
import { CollectionWithBookmarkCount, TagWithBookmarkCount } from "../types";
import { axiosFetchResource } from "../libs/resourceActions";
import { usePathname, useRouter } from "next/navigation";
import { handleRerouting } from "../utils/routeHelper";
import { useSession } from "next-auth/react";

// State structure
interface BookmarkState {
  collections: CollectionWithBookmarkCount[];
  tags: TagWithBookmarkCount[];
}

// Define actions
type Action =
  | { type: "SET_COLLECTIONS"; payload: CollectionWithBookmarkCount[] }
  | { type: "SET_TAGS"; payload: TagWithBookmarkCount[] }
  | {
      type: "FILTER_RESOURCE";
      resource: "collection" | "tag";
      identifier: string;
    }
  | {
      type: "UPDATE_RESOURCE_NAME";
      resource: "collection" | "tag";
      identifier: string;
      name: string;
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
};

function bookmarkReducer(state: BookmarkState, action: Action): BookmarkState {
  let resourceType;

  switch (action.type) {
    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload };
    case "SET_TAGS":
      return { ...state, tags: action.payload };
    case "FILTER_RESOURCE":
      if (action.resource === "collection") {
        resourceType = "collections";
      } else if (action.resource === "tag") {
        resourceType = "tags";
      }
      return {
        ...state,
        [resourceType as "collections" | "tags"]: state[
          resourceType as "collections" | "tags"
        ].filter((item) => item.id !== action.identifier),
      };
    case "UPDATE_RESOURCE_NAME":
      if (action.resource === "collection") {
        resourceType = "collections";
      } else if (action.resource === "tag") {
        resourceType = "tags";
      }
      return {
        ...state,
        [resourceType as "collections" | "tags"]: state[
          resourceType as "collections" | "tags"
        ].map((item) =>
          item.id === action.identifier ? { ...item, name: action.name } : item
        ),
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

  useEffect(() => {
    const fetchData = async (resourceType: "collection" | "tag") => {
      if (sessionToken) {
        const fetchedData = await axiosFetchResource(
          resourceType,
          sessionToken
        );
        const actionType = `SET_${(resourceType + "s").toUpperCase()}` as
          | "SET_COLLECTIONS"
          | "SET_TAGS";
        dispatch({ type: actionType, payload: fetchedData });
      }
    };
    fetchData("collection");
    fetchData("tag");
  }, [sessionToken]);

  useEffect(() => {
    if (session) {
      handleRerouting(pathname, router, state.collections, state.tags, session);
    }
  }, [pathname, router, session, state.collections, state.tags]);

  const value = { state, dispatch };

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
