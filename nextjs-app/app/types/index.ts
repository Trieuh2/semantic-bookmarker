import { Bookmark, Collection, Tag, TagToBookmark } from "@prisma/client";

export type CollectionWithBookmarkCount = Collection & {
  _count: {
    bookmarks: number;
  };
};

export type TagWithBookmarkCount = Tag & {
  _count: {
    tagToBookmarks: number;
  };
};

export type FullBookmarkType = Bookmark & {
  tagToBookmarks?: TagToBookmark[];
  collection?: Collection
};
