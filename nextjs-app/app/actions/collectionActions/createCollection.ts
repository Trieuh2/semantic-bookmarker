import prisma from "@/app/libs/prismadb";
import getUserIdFromUserSession from "../sessionActions/getUserIdFromUserSession";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "@/app/libs/errors";
import { Collection } from "@prisma/client";

const createCollection = async (
  sessionToken: string,
  name: string
): Promise<Collection> => {
  let userId;

  // Get userId from user session or sessionToken
  if (!sessionToken) {
    userId = await getUserIdFromUserSession();
  } else {
    userId = await getUserIdFromSessionToken(sessionToken);
  }

  if (!userId) {
    throw new UnauthorizedError(
      "Error encountered during Collection creation. Failed to fetch userId from session token or user session."
    );
  }
  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Error encountered during Collection creation. Invalid or expired session."
    );
  }

  // Validate request parameters
  if (!name) {
    throw new BadRequestError(
      "Error encountered during Collection creation. Missing required fields: name."
    );
  }

  const existingCollection = await prisma.collection.findFirst({
    where: {
      userId,
      name,
    },
  });

  if (existingCollection) {
    throw new ConflictError(
      "Error encountered during Collection creation. A Collection with this name already exists. Please use a different name."
    );
  }

  // Attempt to create a new Collection
  const newCollection = await prisma.collection.create({
    data: {
      userId,
      name,
    },
  });

  if (!newCollection) {
    throw new Error(
      "Error encountered during Collection creation. Internal Server Error."
    );
  }

  return newCollection;
};

export { createCollection };
