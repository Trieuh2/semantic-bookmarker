import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import { FullBookmarkType } from "@/app/types";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const getBookmarksFromCollection = async (
  sessionToken: string,
  collection_name: string
): Promise<FullBookmarkType[] | null> => {
  // Validate fields
  if (!sessionToken || !collection_name) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Missing required fields (sessionToken, collection_name)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error fetching Bookmark records. Invalid or expired session."
    );
  }

  // Retrieve userId from sessionToken
  const userId = await getUserIdFromSessionToken(sessionToken);

  const decodedCollectionName = decodeURIComponent(collection_name);

  // Fetch Bookmark
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      collection_name: decodedCollectionName,
    },
    include: {
      tagToBookmarks: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookmarks;
};

export default getBookmarksFromCollection;
