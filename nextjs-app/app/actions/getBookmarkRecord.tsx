import prisma from "@/app/libs/prismadb";

const getBookmarkRecord = async (
  sessionToken: string,
  userId: string,
  page_url: string
) => {
  try {
    if (!sessionToken || !userId || !page_url) {
      return null;
    }

    // TODO: VALIDATE SESSION IS VALID

    // Fetch the Session record from the DB
    const bookmarkRecord = await prisma.bookmark.findFirst({
      where: {
        userId,
        page_url,
      },
    });

    if (bookmarkRecord !== null) {
      return bookmarkRecord;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getBookmarkRecord;
