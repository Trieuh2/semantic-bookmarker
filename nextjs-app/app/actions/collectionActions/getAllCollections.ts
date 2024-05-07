import prisma from "@/app/libs/prismadb";
import { BadRequestError, UnauthorizedError } from "../../libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { CollectionWithBookmarkCount } from "@/app/types";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const getAllCollections = async (
  sessionToken: string
): Promise<CollectionWithBookmarkCount[]> => {
  // Validate fields
  if (!sessionToken) {
    throw new BadRequestError(
      "Error fetching collections. Missing required fields: sessionToken"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error fetching collections. Invalid or expired session."
    );
  }

  // Retrieve userId from sessionToken
  const userId = await getUserIdFromSessionToken(sessionToken);

  // Fetch Collections
  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
      children: {
        include: {
          _count: {
            select: { bookmarks: true },
          },
        },
      },
    },
  });

  return collections;
};

export default getAllCollections;
