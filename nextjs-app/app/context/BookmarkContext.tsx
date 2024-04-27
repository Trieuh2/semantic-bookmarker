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
import { handleRerouting } from "../utils/routeHelper";
import { useSession } from "next-auth/react";

interface BookmarkContextType {
  collections: CollectionWithBookmarkCount[];
  setCollections: (collections: CollectionWithBookmarkCount[]) => void;
  tags: TagWithBookmarkCount[];
  setTags: (tags: TagWithBookmarkCount[]) => void;
  filterClientResourceState: (type: string, identifier: string) => void;
  updateClientResourceName: (
    type: string,
    identifier: string,
    name: string
  ) => void;
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
  const session = useSession();

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
    handleRerouting(pathname, router, collections, tags, session);
  }, [pathname, router, collections, tags, session]);

  const filterClientResourceState = (
    type: string,
    identifier: string
  ): void => {
    if (type === "collection") {
      setCollections((prevCollections) =>
        prevCollections.filter((collection) => collection.id !== identifier)
      );
    } else if (type === "tag") {
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== identifier));
    }
  };

  const updateClientResourceName = (
    type: string,
    identifier: string,
    name: string
  ): void => {
    if (type === "collection") {
      setCollections((prevCollections) =>
        prevCollections.map((collection) => {
          if (collection.id === identifier) {
            return { ...collection, name: name };
          } else {
            return collection;
          }
        })
      );
    } else if (type === "tag") {
      setTags((prevTags) =>
        prevTags.map((tag) => {
          if (tag.id === identifier) {
            return { ...tag, name: name };
          } else {
            return tag;
          }
        })
      );
    }
  };

  const value = useMemo(
    () => ({
      collections,
      setCollections,
      tags,
      setTags,
      filterClientResourceState,
      updateClientResourceName,
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
