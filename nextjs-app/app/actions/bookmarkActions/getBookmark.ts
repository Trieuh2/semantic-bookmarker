import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Bookmark } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../libs/errors";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const getBookmark = async (
  sessionToken: string,
  page_url: string
): Promise<Bookmark | null> => {
  // Validate fields
  if (!sessionToken || !page_url) {
    throw new BadRequestError(
      "Error fetching Bookmark record. Missing required fields (sessionToken, page_url)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error fetching Bookmark record. Invalid or expired session."
    );
  }

  // Retrieve userId from sessionToken
  const userId = await getUserIdFromSessionToken(sessionToken);

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
    throw new NotFoundError(
      "Error fetching Bookmark record. Bookmark not found."
    );
  }

  return bookmark;
};

export default getBookmark;
