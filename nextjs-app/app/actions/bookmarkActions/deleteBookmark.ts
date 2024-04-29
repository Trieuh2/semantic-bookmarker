import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import { Bookmark } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../libs/errors";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";
import deleteImage from "../imageActions/deleteImage";

const deleteBookmark = async (
  sessionToken: string,
  id: string
): Promise<Bookmark> => {
  if (!sessionToken || !id) {
    throw new BadRequestError(
      "Error encountered during Bookmark deletion. Missing required fields (sessionToken, id)"
    );
  }

  // Validate session
  const isSessionValid = await getIsSessionValid(sessionToken);
  if (!isSessionValid) {
    throw new UnauthorizedError(
      "Error encountered during Bookmark deletion. Invalid or expired session."
    );
  }

  const userId = await getUserIdFromSessionToken(sessionToken);

  // Check if the bookmark exists before deletion to handle not found error gracefully
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId, id },
  });

  if (!bookmark) {
    throw new NotFoundError(
      "Error encountered during Bookmark deletion. Bookmark not found."
    );
  }
  
  // Attempt to delete associated image
  try {
    await deleteImage(sessionToken, id, "favIcon");
  } catch (error) {
    console.log("Error deleting image during Bookmark deletion.", error);
  }

  // If bookmark exists, proceed with deletion
  const deletedBookmark = await prisma.bookmark.delete({
    where: {
      userId,
      id,
    },
  });

  if (!deletedBookmark) {
    throw new Error(
      "Error encountered during Bookmark deletion. Internal Server Error."
    );
  }
  return deletedBookmark;
};

export default deleteBookmark;
