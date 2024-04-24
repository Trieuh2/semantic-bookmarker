import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import { FullBookmarkType } from "@/app/types";

const getBookmarksFromTagId = async (
  userId: string,
  sessionToken: string,
  tagId: string
): Promise<FullBookmarkType[] | null> => {
  // Validate fields
  if (!userId || !sessionToken || !tagId) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Missing required fields (userId, sessionToken, tagId)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error fetching Bookmark records. Invalid or expired session."
    );
  }

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
    },
  });

  return bookmarks;
};

export default getBookmarksFromTagId;
