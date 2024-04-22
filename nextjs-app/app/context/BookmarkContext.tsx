import { Collection, Tag } from "@prisma/client";
import axios from "axios";
import { getSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";

interface BookmarkContextType {
  userId: string;
  sessionToken: string;
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  // const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      const nextAuthSession = await getSession();
      if (
        nextAuthSession &&
        nextAuthSession.sessionToken &&
        nextAuthSession.userId
      ) {
        setUserId(nextAuthSession.userId);
        setSessionToken(nextAuthSession.sessionToken);
      }
    };
    fetchSession();
  }, []);

  // Fetch collections and tags
  useEffect(() => {
    if (userId && sessionToken) {
      const fetchCollections = async () => {
        try {
          const params = {
            userId: userId,
            sessionToken: sessionToken,
          };
          const axiosResponse = await axios.get(
            "http://localhost:3000/api/collection/",
            { params }
          );

          if (axiosResponse.status === 200) {
            const apiData = axiosResponse.data.data as Collection[];
            const filteredCollections = apiData.filter(
              (collection: Collection) => collection.name != "Unsorted"
            );
            setCollections(filteredCollections);
          }
        } catch (error) {
          console.log(error);
        }
      };
      const fetchTags = async () => {
        try {
          const params = {
            userId: userId,
            sessionToken: sessionToken,
          };
          const axiosResponse = await axios.get(
            "http://localhost:3000/api/tag/",
            { params }
          );

          if (axiosResponse.status === 200) {
            setTags(axiosResponse.data.data);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchCollections();
      fetchTags();
    }
  }, [userId, sessionToken]);

  return (
    <BookmarkContext.Provider
      value={{
        userId,
        sessionToken,
        collections,
        setCollections,
        tags,
        setTags,
      }}
    >
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
