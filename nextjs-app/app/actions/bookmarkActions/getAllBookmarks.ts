import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";
import { FullBookmarkType } from "@/app/types";

const getAllBookmarks = async (
  sessionToken: string
): Promise<FullBookmarkType[] | null> => {
  // Validate fields
  if (!sessionToken) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Session token is required."
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

export default getAllBookmarks;
