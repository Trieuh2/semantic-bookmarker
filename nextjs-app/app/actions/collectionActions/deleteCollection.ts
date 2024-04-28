import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Collection } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../libs/errors";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const deleteCollection = async (
  sessionToken: string,
  id: string
): Promise<Collection> => {
  if (!sessionToken || !id) {
    throw new BadRequestError(
      "Error encountered during Collection deletion. Missing required fields (sessionToken, id)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error encountered during Collection deletion. Invalid or expired session."
    );
  }

  const userId = await getUserIdFromSessionToken(sessionToken);

  // Check if the bookmark exists before deletion to handle not found error gracefully
  const collection = await prisma.collection.findFirst({
    where: { userId, id },
  });

  if (!collection) {
    throw new NotFoundError(
      "Error encountered during Collection deletion. Collection not found."
    );
  }

  // Set all associated Bookmark's collectionId to the Unsorted collection
  const unsortedCollection = await getOrCreateUnsortedCollection(userId);
  await prisma.bookmark.updateMany({
    where: {
      userId,
      collectionId: collection.id,
    },
    data: {
      collectionId: unsortedCollection.id,
    },
  });

  // Proceed with deletion
  const deletedCollection = await prisma.collection.delete({
    where: {
      userId,
      id: collection.id,
    },
  });

  if (!deletedCollection) {
    throw new Error(
      "Error encountered during Collection deletion. Internal Server Error."
    );
  }
  return deletedCollection;
};

const getOrCreateUnsortedCollection = async (
  userId: string
): Promise<Collection> => {
  if (!userId) {
    throw new BadRequestError(
      "Failed to get or create unsorted collection. Missing required field: userId."
    );
  }

  const unsortedCollection = await prisma.collection.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });

  if (unsortedCollection) {
    return unsortedCollection;
  }

  const newUnsortedCollection = await prisma.collection.create({
    data: {
      userId,
      isDefault: true,
      name: "Unsorted",
    },
  });

  return newUnsortedCollection;
};

export default deleteCollection;
