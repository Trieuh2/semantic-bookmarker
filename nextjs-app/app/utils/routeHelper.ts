import { SessionContextValue } from "next-auth/react";
import { CollectionWithBookmarkCount, TagWithBookmarkCount } from "../types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getUrlInfo } from "./urlActions";

export const handleRerouting = (
  pathname: string,
  router: AppRouterInstance,
  collections: CollectionWithBookmarkCount[],
  tags: TagWithBookmarkCount[],
  session: SessionContextValue
) => {
  if (!session || session?.status === "unauthenticated") {
    router.push("/");
  } else if (
    session &&
    session?.status === "authenticated" &&
    !isValidDynamicRoute(pathname, collections, tags)
  ) {
    router.push("/home/bookmarks");
  }
};

export const isValidDynamicRoute = (
  pathname: string,
  collections: CollectionWithBookmarkCount[],
  tags: TagWithBookmarkCount[]
): boolean => {
  const urlInfo = getUrlInfo(pathname);

  if (
    urlInfo.directory === "collections" &&
    collections &&
    collections.length
  ) {
    return collections.some((collection) => collection.id === urlInfo.id);
  }
  if (urlInfo.directory === "tags" && tags) {
    return tags.some((tag) => tag.id === urlInfo.id);
  }
  if (urlInfo.directory === "bookmarks" && urlInfo.subdirectory === "search") {
    return true;
  }
  return false;
};
