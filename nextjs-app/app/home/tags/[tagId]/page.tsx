"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { FullBookmarkType } from "@/app/types";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface TagsDetailedPageProps {}

const TagsDetailedPage: React.FC<TagsDetailedPageProps> = ({}) => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[]>();
  const { userId, sessionToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { tags } = useBookmarks();

  // Fetch the Bookmark records
  useEffect(() => {
    if (userId && sessionToken) {
      const fetchBookmarks = async (tagId: string) => {
        const base_url = "http://localhost:3000/api/bookmark";
        const params = {
          tagId: tagId,
        };
        const queryString = new URLSearchParams(params).toString();
        const url = `${base_url}?${queryString}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (response.status === 200) {
          const responseBody = await response.json();
          setInitialItems(responseBody.data);
        }
      };

      const tagId = pathname.split("/").pop() ?? "";

      // Redirect if the tagId is not found
      if (!tags.some((tag) => tag.id === tagId)) {
        router.push("/home/bookmarks");
        return;
      }

      if (userId && sessionToken && tagId) {
        fetchBookmarks(tagId);
      }
    }
  }, [userId, sessionToken, pathname, tags, router]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default TagsDetailedPage;
