import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "./getIsSessionValid";

interface DeleteResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const deleteBookmark = async (
  id: string,
  sessionToken: string,
  userId: string
): Promise<DeleteResponse> => {
  try {
    if (!sessionToken || !userId || !id) {
      throw new Error(
        "Missing required fields (sessionToken, userId, page_url)"
      );
    }

    const isSessionValid = await getIsSessionValid(sessionToken);

    if (!isSessionValid) {
      throw new Error("Invalid or expired session.");
    }

    // Fetch the Session record from the DB
    const deletedBookmark = await prisma.bookmark.delete({
      where: {
        userId,
        id,
      },
    });

    return { success: true, data: deletedBookmark };
  } catch (error) {
    console.error(error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return { success: false, error: errorMessage };
  }
};

export default deleteBookmark;
