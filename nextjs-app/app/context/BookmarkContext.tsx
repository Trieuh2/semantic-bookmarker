"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { CollectionWithBookmarkCount, TagWithBookmarkCount } from "../types";
import { fetchResource } from "../libs/resourceActions";
import { usePathname, useRouter } from "next/navigation";
import { rerouteIfInvalidDynamicRoute } from "../utils/routeHelper";

interface BookmarkContextType {
  collections: CollectionWithBookmarkCount[];
  setCollections: (collections: CollectionWithBookmarkCount[]) => void;
  tags: TagWithBookmarkCount[];
  setTags: (tags: TagWithBookmarkCount[]) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collections, setCollections] = useState<CollectionWithBookmarkCount[]>(
    []
  );
  const [tags, setTags] = useState<TagWithBookmarkCount[]>([]);
  const { sessionToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const fetchCollections = useCallback(async () => {
    if (sessionToken) {
      const fetchedCollections = await fetchResource(
        "collection",
        sessionToken
      );
      setCollections(
        fetchedCollections.filter(
          (collection: CollectionWithBookmarkCount) =>
            collection.name != "Unsorted"
        )
      );
    }
  }, [sessionToken]);

  const fetchTags = useCallback(async () => {
    if (sessionToken) {
      const fetchedTags = await fetchResource("tag", sessionToken);
      setTags(fetchedTags);
    }
  }, [sessionToken]);

  useEffect(() => {
    fetchCollections();
    fetchTags();
  }, [fetchCollections, fetchTags]);

  useEffect(() => {
    rerouteIfInvalidDynamicRoute(pathname, router, collections, tags);
  }, [pathname, router, collections, tags]);

  const value = useMemo(
    () => ({
      collections,
      setCollections,
      tags,
      setTags,
    }),
    [collections, tags]
  );

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
