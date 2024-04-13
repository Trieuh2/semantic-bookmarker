import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "./getIsSessionValid";

const getBookmarkRecord = async (
  sessionToken: string,
  userId: string,
  page_url: string
) => {
  try {
    if (!sessionToken || !userId || !page_url) {
      throw new Error(
        "Missing required fields (sessionToken, userId, page_url)"
      );
    }

    const isSessionValid = await getIsSessionValid(sessionToken);

    if (!isSessionValid) {
      throw new Error("Invalid or expired session.");
    }

    // Fetch the Session record from the DB
    const bookmarkRecord = await prisma.bookmark.findFirst({
      where: {
        userId,
        page_url,
      },
    });

    return bookmarkRecord;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getBookmarkRecord;
