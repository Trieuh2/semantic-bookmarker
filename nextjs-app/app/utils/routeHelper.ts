import { CollectionWithBookmarkCount, TagWithBookmarkCount } from "../types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const rerouteIfInvalidDynamicRoute = (
  pathname: string,
  router: AppRouterInstance,
  collections: CollectionWithBookmarkCount[],
  tags: TagWithBookmarkCount[]
) => {
  if (!isValidDynamicRoute(pathname, collections, tags)) {
    router.push("/home/bookmarks");
  }
};

export const isValidDynamicRoute = (
  pathname: string,
  collections: CollectionWithBookmarkCount[],
  tags: TagWithBookmarkCount[]
): boolean => {
  // Get type of resource (collection or tag)
  const pathSegments = pathname.split("/");
  const resourceType = pathSegments[2];
  const resourceIdentifier = pathSegments[3];

  if (resourceType === "collections" && collections && collections.length) {
    return collections.some(
      (collection) => collection.id === resourceIdentifier
    );
  }
  if (resourceType === "tags" && tags) {
    return tags.some((tag) => tag.id === resourceIdentifier);
  }
  return false;
};
