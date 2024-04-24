import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Bookmark } from "@prisma/client";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";

const getBookmarksFromCollection = async (
  userId: string,
  sessionToken: string,
  collection_name: string
): Promise<Bookmark[] | null> => {
  // Validate fields
  if (!userId || !sessionToken || !collection_name) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Missing required fields (userId, sessionToken, collection_name)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error fetching Bookmark records. Invalid or expired session."
    );
  }
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
