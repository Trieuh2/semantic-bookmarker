import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { FullCollectionType } from "../types";

const getCollections = async (): Promise<FullCollectionType[]> => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return [];
  }

  try {
    const collections = await prisma.collection.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: {
          equals: currentUser.id,
        },
      },
      include: {
        bookmarks: true,
      },
    });

    return collections;
  } catch (error: any) {
    return [];
  }
};

export default getCollections;
