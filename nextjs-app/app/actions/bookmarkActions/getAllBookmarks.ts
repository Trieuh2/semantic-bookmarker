import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Bookmark } from "@prisma/client";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";

const getAllBookmarks = async (
  userId: string,
  sessionToken: string
): Promise<Bookmark[] | null> => {
  // Validate fields
  if (!userId || !sessionToken) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Missing required fields (userId, sessionToken)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error fetching Bookmark records. Invalid or expired session."
    );
  }

  // Fetch Bookmark
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
    },
    include: {
      tagToBookmarks: true,
    },
  });

  return bookmarks;
};

export default getAllBookmarks;
