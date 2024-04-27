import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/app/libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import prisma from "@/app/libs/prismadb";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const updateCollection = async (
  sessionToken: string,
  id: string,
  name: string
) => {
  if (!sessionToken || !id || !name) {
    throw new BadRequestError(
      "Error updating Collection. Missing required fields: sessionToken, id, name."
    );
  }

  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Error updating Collection. Invalid or expired session."
    );
  }

  const existingCollection = await prisma.collection.findFirst({
    where: {
      id,
    },
  });

  if (!existingCollection) {
    throw new NotFoundError(
      "Error updating Collection. Collection does not exist."
    );
  }

  const userId = await getUserIdFromSessionToken(sessionToken);
  const collectionWithSameName = await prisma.collection.findFirst({
    where: {
      userId,
      name,
    },
  });
  if (collectionWithSameName) {
    throw new BadRequestError(
      "Error updating Collection. A Collection with the same name already exists. Please provide a unique Collection name."
    );
  }

  const updatedCollection = await prisma.collection.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  return updatedCollection;
};

export default updateCollection;
