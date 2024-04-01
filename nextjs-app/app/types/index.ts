import { Bookmark, Collection } from "@prisma/client";

export type FullCollectionType = Collection & {
  bookmarks: Bookmark[];
};
