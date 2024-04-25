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

  // If bookmark exists, proceed with deletion
  const deletedCollection = await prisma.collection.delete({
    where: {
      userId,
      id,
    },
  });

  if (!deletedCollection) {
    throw new Error(
      "Error encountered during Collection deletion. Internal Server Error."
    );
  }
  return deletedCollection;
};

export default deleteCollection;
