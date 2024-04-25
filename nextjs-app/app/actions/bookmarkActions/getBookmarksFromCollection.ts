import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import { FullBookmarkType } from "@/app/types";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const getBookmarksFromCollection = async (
  sessionToken: string,
  id: string
): Promise<FullBookmarkType[] | null> => {
  // Validate fields
  if (!sessionToken || !id) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Missing required fields (sessionToken, id)"
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

  // Fetch Bookmark
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      collectionId: id,
    },
    include: {
      tagToBookmarks: true,
      collection: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookmarks.map((bookmark) => ({
    ...bookmark,
    tagToBookmarks: bookmark.tagToBookmarks || undefined,
    collection: bookmark.collection || undefined,
  }));
};

export default getBookmarksFromCollection;
