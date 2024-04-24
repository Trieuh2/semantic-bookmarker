import prisma from "@/app/libs/prismadb";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { CollectionWithBookmarkCount } from "@/app/types";

const getAllCollections = async (
  userId: string,
  sessionToken: string
): Promise<CollectionWithBookmarkCount[]> => {
  // Validate fields
  if (!sessionToken || !userId) {
    throw new BadRequestError(
      "Error fetching collections. Missing required fields: userId, sessionToken"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error fetching collections. Invalid or expired session."
    );
  }

  // Fetch Collections
  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  // if (!collections) {
  //   throw new NotFoundError(
  //     "Error fetching collections. No collections found."
  //   );
  // }

  return collections;
};

export default getAllCollections;
