import prisma from "@/app/libs/prismadb";
import { Collection } from "@prisma/client";
import { BadRequestError } from "../../libs/errors";

const createOrFetchCollection = async (
  userId: string,
  collection_name: string
): Promise<Collection> => {
  if (!userId || !collection_name) {
    throw new BadRequestError(
      "Error creating or fetching collection. Missing required userId or collection_name."
    );
  }

  // Fetch existing collection
  const collection = await prisma.collection.findFirst({
    where: {
      userId,
      name: collection_name,
    },
  });
  if (collection) {
    return collection;
  }

  // Create new collection
  const newCollection = await prisma.collection.create({
    data: {
      userId,
      name: collection_name,
    },
  });
  if (!newCollection) {
    throw new Error(
      "Error creating collection. Missing required userId or collection_name."
    );
  }
  return newCollection;
};

export default createOrFetchCollection;
