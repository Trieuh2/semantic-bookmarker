"use client";

import axios from "axios";
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

  const fetchCollections = useCallback(async () => {
    if (sessionToken) {
      try {
        const axiosResponse = await axios.get(
          "http://localhost:3000/api/collection/",
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );
        if (axiosResponse.status === 200) {
          const apiData = axiosResponse.data
            .data as CollectionWithBookmarkCount[];
          setCollections(
            apiData.filter((collection) => collection.name != "Unsorted")
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [sessionToken]);

  const fetchTags = useCallback(async () => {
    if (sessionToken) {
      try {
        const axiosResponse = await axios.get(
          "http://localhost:3000/api/tag/",
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );
        if (axiosResponse.status === 200) {
          setTags(axiosResponse.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [sessionToken]);

  useEffect(() => {
    fetchCollections();
    fetchTags();
  }, [fetchCollections, fetchTags]);

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
