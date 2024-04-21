import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Bookmark } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../libs/errors";

const deleteBookmark = async (
  userId: string,
  sessionToken: string,
  id: string
): Promise<Bookmark> => {
  if (!userId || !sessionToken || !id) {
    throw new BadRequestError(
      "Missing required fields (userId, sessionToken, id)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError("Invalid or expired session.");
  }

  // Check if the bookmark exists before deletion to handle not found error gracefully
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId, id },
  });

  if (!bookmark) {
    throw new NotFoundError("Bookmark not found.");
  }

  // If bookmark exists, proceed with deletion
  const deletedBookmark = await prisma.bookmark.delete({
    where: {
      userId,
      id,
    },
  });

  if (!deletedBookmark) {
    throw new Error("Error deleting Bookmark record.");
  }
  return deletedBookmark;
};

export default deleteBookmark;
