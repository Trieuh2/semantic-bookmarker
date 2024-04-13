import { Bookmark, Collection } from "@prisma/client";

export type FullCollectionType = Collection & {
  bookmarks: Bookmark[];
};

export class SessionError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "SessionError";
  }
}
