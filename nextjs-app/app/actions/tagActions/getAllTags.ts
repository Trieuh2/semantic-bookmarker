import prisma from "@/app/libs/prismadb";
import { BadRequestError, UnauthorizedError } from "@/app/libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { TagWithBookmarkCount } from "@/app/types";

const getAllTags = async (
  userId: string,
  sessionToken: string
): Promise<TagWithBookmarkCount[]> => {
  if (!userId || !sessionToken) {
    throw new BadRequestError(
      "Error fetching tags. Missing required fields: userId, sessionToken"
    );
  }

  // Validate session
  if (!(await getIsSessionValid)) {
    throw new UnauthorizedError("Error fetching tags. Unauthorized.");
  }

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
