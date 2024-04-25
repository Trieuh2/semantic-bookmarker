import { BadRequestError, UnauthorizedError } from "@/app/libs/errors";
import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Tag } from "@prisma/client";

const deleteTag = async (sessionToken: string, id: string): Promise<Tag> => {
  if (!sessionToken || !id) {
    throw new BadRequestError(
      "Failed to delete Tag record. Missing required fields: sessionToken, id."
    );
  }

  // Validate the session
  if (!getIsSessionValid(sessionToken)) {
    throw new UnauthorizedError(
      "Failed to delete Tag record. Invalid or expired session."
    );
  }

  const deletedTag = await prisma.tag.delete({
    where: {
      id,
    },
  });

  return deletedTag;
};

export default deleteTag;
