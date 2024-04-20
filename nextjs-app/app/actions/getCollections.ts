import prisma from "@/app/libs/prismadb";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../libs/errors";
import getIsSessionValid from "./getIsSessionValid";
import { Collection } from "@prisma/client";

const getCollections = async (
  userId: string,
  sessionToken: string
): Promise<Collection[]> => {
  // Validate fields
  if (!sessionToken || !userId) {
    throw new BadRequestError("Missing required fields: userId, sessionToken");
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError("Invalid or expired session.");
  }

  // Fetch Collections
  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    take: 10,
  });

  if (!collections) {
    throw new NotFoundError("No collections found.");
  }

  return collections;
};

export default getCollections;
