import prisma from "@/app/libs/prismadb";
import { Collection } from "@prisma/client";
import { BadRequestError } from "../libs/errors";

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

export default createOrFetchCollection;
