import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/app/libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import prisma from "@/app/libs/prismadb";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const updateTag = async (sessionToken: string, id: string, name: string) => {
  if (!sessionToken || !id || !name) {
    throw new BadRequestError(
      "Error updating Tag. Missing required fields: sessionToken, id, name."
    );
  }

  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Error updating Tag. Invalid or expired session."
    );
  }

  const existingTag = await prisma.tag.findFirst({
    where: {
      id,
    },
  });

  if (!existingTag) {
    throw new NotFoundError("Error updating Tag. Tag does not exist.");
  }

  const userId = await getUserIdFromSessionToken(sessionToken);
  const tagWithSameName = await prisma.tag.findFirst({
    where: {
      userId,
      name,
    },
  });
  if (tagWithSameName) {
    throw new BadRequestError(
      "Error updating Tag. A tag with the same name already exists. Please provide a unique tag name."
    );
  }

  const updatedTag = await prisma.tag.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  return updatedTag;
};

export default updateTag;
