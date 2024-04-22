import prisma from "@/app/libs/prismadb";
import { BadRequestError, UnauthorizedError } from "@/app/libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";

const getTags = async (userId: string, sessionToken: string) => {
  if (!userId || !sessionToken) {
    throw new BadRequestError(
      "Error fetching tags. Missing required fields: userId, sessionToken"
    );
  }

  // Validate session
  if (!(await getIsSessionValid)) {
    throw new UnauthorizedError("Error fetching tags. Unauthorized.");
  }

  // Attempt fetch
  const tags = await prisma.tag.findMany({
    where: {
      userId,
    },
  });

  return tags;
};

export default getTags;
