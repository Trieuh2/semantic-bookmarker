import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "./getIsSessionValid";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../libs/errors";
import { Bookmark, Collection } from "@prisma/client";

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
    throw new UnauthorizedError("Invalid or expired session.");
  }

  // Validate fields
  if (!userId || !sessionToken || !title || !page_url) {
    throw new BadRequestError(
      "Missing required fields (userId, sessionToken, title, page_url, collection_name)."
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
    throw new ConflictError("Bookmark already exists for this URL.");
  }

  // Create or fetch the collection
  const collection = await createOrFetchCollection(
    userId,
    collection_name ? collection_name : "Unsorted"
  );
  if (!collection) {
    throw new Error(
      "Error creating or fetching collection to associate with Bookmark record."
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
    throw new Error("Error creating new Bookmark record.");
  }

  return newBookmark;
};

const createOrFetchCollection = async (
  userId: string,
  collection_name: string
): Promise<Collection> => {
  if (!userId || !collection_name) {
    throw new BadRequestError("Missing required userId or collection_name.");
  }

  const collection = await prisma.collection.findFirst({
    where: {
      userId,
      name: collection_name,
    },
  });

  if (!collection) {
    const newCollection = await prisma.collection.create({
      data: {
        userId,
        name: collection_name,
      },
    });
    return newCollection;
  }
  return collection;
};

export default addBookmark;
