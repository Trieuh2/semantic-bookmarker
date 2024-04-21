import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Bookmark } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../libs/errors";

const getBookmark = async (
  userId: string,
  sessionToken: string,
  page_url: string
): Promise<Bookmark | null> => {
  // Validate fields
  if (!userId || !sessionToken || !page_url) {
    throw new BadRequestError(
      "Missing required fields (userId, sessionToken, page_url)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError("Invalid or expired session.");
  }

  // Fetch Bookmark
  const bookmark = await prisma.bookmark.findFirst({
    where: {
      userId,
      page_url,
    },
    include: {
      tagToBookmarks: true,
    },
  });

  if (!bookmark) {
    throw new NotFoundError("Bookmark not found.");
  }

  return bookmark;
};

export default getBookmark;
