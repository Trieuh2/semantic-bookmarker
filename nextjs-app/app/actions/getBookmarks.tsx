import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getBookmarks = async (collectionId: string) => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return [];
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: {
          equals: currentUser.id,
        },
        collectionId: {
          equals: collectionId,
        },
      },
    });

    return bookmarks;
  } catch (error: any) {
    return [];
  }
};

export default getBookmarks;
