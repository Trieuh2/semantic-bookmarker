import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../../libs/errors";
import { Bookmark } from "@prisma/client";
import createOrFetchCollection from "../collectionActions/createOrFetchCollection";

const addBookmark = async (
  userId: string,
  sessionToken: string,
  title: string,
  page_url: string,
  collection_name: string,
  note?: string,
  excerpt?: string
): Promise<Bookmark | null> => {
  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError("Error encountered during Bookmark creation. Invalid or expired session.");
  }

  // Validate fields
  if (!userId || !sessionToken || !title || !page_url) {
    throw new BadRequestError(
      "Error encountered during Bookmark creation. Missing required fields (userId, sessionToken, title, page_url, collection_name)."
    );
  }

  // Check if bookmark already exists for this url
  const existingBookmark = await prisma.bookmark.findFirst({
    where: {
      userId: userId,
      page_url: page_url,
    },
  });

  if (existingBookmark) {
    throw new ConflictError(
      "Error encountered during Bookmark creation. Bookmark already exists for this page URL."
    );
  }

  // Create or fetch the collection
  const collection = await createOrFetchCollection(
    userId,
    collection_name ? collection_name : "Unsorted"
  );
  if (!collection) {
    throw new Error(
      "Error encountered during Bookmark creation. Error creating or fetching associated Collection record."
    );
  }

  const newBookmark = await prisma.bookmark.create({
    data: {
      title: title,
      page_url: page_url,
      note: note ?? "",
      excerpt: excerpt ?? "",
      userId: userId,
      collection_name: collection.name,
    },
  });

  if (!newBookmark) {
    throw new Error(
      "Error encountered during Bookmark creation. Internal Server Error."
    );
  }

  return newBookmark;
};

export default addBookmark;
