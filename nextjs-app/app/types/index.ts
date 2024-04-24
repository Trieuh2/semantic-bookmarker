import { Bookmark, Collection, TagToBookmark } from "@prisma/client";

// Define a new type that includes the count of bookmarks
export type CollectionWithBookmarkCount = Collection & {
  _count: {
    bookmarks: number;
  };
};

export type FullBookmarkType = Bookmark & {
  tagToBookmarks: TagToBookmark[];
};
