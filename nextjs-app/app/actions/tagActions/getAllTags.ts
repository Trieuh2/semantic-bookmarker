import prisma from "@/app/libs/prismadb";
import { BadRequestError, UnauthorizedError } from "@/app/libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { TagWithBookmarkCount } from "@/app/types";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const getAllTags = async (
  sessionToken: string
): Promise<TagWithBookmarkCount[]> => {
  if (!sessionToken) {
    throw new BadRequestError(
      "Error fetching tags. Missing required fields: sessionToken"
    );
  }

  // Validate session
  if (!(await getIsSessionValid)) {
    throw new UnauthorizedError("Error fetching tags. Unauthorized.");
  }

  // Retrieve userId from sessionToken
  const userId = await getUserIdFromSessionToken(sessionToken);

  // Attempt fetch
  const tags = await prisma.tag.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: { tagToBookmarks: true },
      },
    },
  });

  return tags;
};

export default getAllTags;
