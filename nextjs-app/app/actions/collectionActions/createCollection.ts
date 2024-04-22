import prisma from "@/app/libs/prismadb";
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
  // Validate request parameters
  if (!name) {
    throw new BadRequestError(
      "Error encountered during collection creation. Missing required fields: sessionToken, name."
    );
  }

  // Validate session
  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Error encountered during collection creation. Invalid or expired session."
    );
  }

  const userId = await getUserIdFromSessionToken(sessionToken);

  const existingCollection = await prisma.collection.findFirst({
    where: {
      userId,
      name,
    },
  });

  if (existingCollection) {
    throw new ConflictError(
      "Error encountered during collection creation. A Collection with this name already exists. Please use a different name."
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
      "Error encountered during collection creation. Internal Server Error."
    );
  }

  return newCollection;
};

export { createCollection };
