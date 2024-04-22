import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "@/app/actions/sessionActions/getIsSessionValid";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "@/app/libs/errors";

const createTag = async (
  userId: string,
  sessionToken: string,
  name: string
) => {
  // Validate request parameters
  if (!userId || !sessionToken || !name) {
    throw new BadRequestError(
      "Failed to create Tag. Missing required fields: userId, sessionToken, name"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);

  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Failed to create Tag. Session is invalid or expired"
    );
  }

  // Check if Tag already exists for this user
  const existingTag = await prisma.tag.findFirst({
    where: {
      userId,
      name,
    },
  });

  if (existingTag) {
    throw new ConflictError(
      "Failed to create Tag. A tag with this name already exists. Tag names must be unique."
    );
  }

  // Attempt to create new Tag
  const newTag = await prisma.tag.create({
    data: {
      name: name,
      userId: userId,
    },
  });

  if (!newTag) {
    throw new Error("Failed to create Tag. Internal Server Error.");
  }
  return newTag;
};

export default createTag;
