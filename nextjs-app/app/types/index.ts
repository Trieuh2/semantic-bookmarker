import { Bookmark, Collection, TagToBookmark } from "@prisma/client";

export type FullCollectionType = Collection & {
  bookmarks: Bookmark[];
};

export type FullBookmarkType = Bookmark & {
  tagToBookmarks: TagToBookmark[]
};
