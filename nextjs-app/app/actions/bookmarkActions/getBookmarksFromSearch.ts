import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";
import { FullBookmarkType } from "@/app/types";

const getBookmarksFromSearch = async (
  sessionToken: string,
  searchQuery: string
): Promise<FullBookmarkType[] | null> => {
  // Validate fields
  if (!sessionToken || !searchQuery) {
    throw new BadRequestError(
      "Error fetching Bookmark records. Missing required fields: sessionToken, searchQuery."
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
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: "insensitive", // Case-insensitive matching
          },
        },
        {
          page_url: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          note: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          excerpt: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          collection: {
            is: {
              name: {
                contains: searchQuery,
                mode: "insensitive", // Case-insensitive matching
              },
            },
          },
        },
      ],
    },
    include: {
      tagToBookmarks: {
        include: {
          tag: true,
        },
      },
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

export default getBookmarksFromSearch;
