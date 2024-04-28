"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { axiosFetchResource } from "@/app/libs/resourceActions";
import { FullBookmarkType } from "@/app/types";
import { getUrlInfo } from "@/app/utils/urlActions";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface TagsDetailedPageProps {}

const TagsDetailedPage: React.FC<TagsDetailedPageProps> = ({}) => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[]>();
  const { sessionToken } = useAuth();
  const pathname = usePathname();
  const { state } = useBookmarks();
  const urlInfo = getUrlInfo(pathname);

  // Fetch the Bookmark records related to this Tag
  useEffect(() => {
    if (sessionToken) {
      const fetchBookmarks = async (tagId: string) => {
        const params = {
          tagId: tagId,
        };
        const bookmarks = await axiosFetchResource(
          "bookmark",
          sessionToken,
          params
        );
        setInitialItems(bookmarks);
      };

      const tagId = urlInfo.id;

      if (sessionToken && tagId) {
        fetchBookmarks(tagId);
      }
    }
  }, [sessionToken, pathname, state.tags, urlInfo.id]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default TagsDetailedPage;
