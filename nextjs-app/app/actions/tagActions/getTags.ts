import prisma from "@/app/libs/prismadb";
import getCurrentUser from "../getCurrentUser";

const getTags = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return [];
  }

  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        userId: {
          equals: currentUser.id,
        },
      },
    });

    return tags;
  } catch (error) {
    return [];
  }
};

export default getTags;
