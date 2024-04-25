import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import { FullBookmarkType } from "@/app/types";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const getBookmarksFromTagId = async (
  sessionToken: string,
  tagId: string
): Promise<FullBookmarkType[] | null> => {
  // Validate fields
  if (!sessionToken || !tagId) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Missing required fields (sessionToken, tagId)"
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

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      tagToBookmarks: {
        some: {
          userId,
          tagId,
        },
      },
    },
    include: {
      tagToBookmarks: true,
      collection: true,
    },
  });

  return bookmarks.map((bookmark) => ({
    ...bookmark,
    tagToBookmarks: bookmark.tagToBookmarks || undefined,
    collection: bookmark.collection || undefined,
  }));
};

export default getBookmarksFromTagId;
