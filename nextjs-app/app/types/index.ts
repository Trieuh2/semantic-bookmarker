import { Bookmark, Collection, Tag, TagToBookmark } from "@prisma/client";

export type FullBookmarkType = Bookmark & {
  tagToBookmarks?: (TagToBookmark & { tag?: Tag })[];
  collection?: Collection;
};

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

export type TagToBookmarkWithTag = TagToBookmark & {
  tag: Tag;
};
