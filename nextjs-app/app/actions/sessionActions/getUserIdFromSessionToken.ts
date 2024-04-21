import prisma from "@/app/libs/prismadb";
import { NotFoundError } from "../../libs/errors";

const getUserIdFromSessionToken = async (sessionToken: string) => {
  const sessionRecord = await prisma?.session.findFirst({
    where: {
      sessionToken,
    },
  });

  if (!sessionRecord) {
    throw new NotFoundError(
      "Error retrieving userId from session token. No session record found for the associated session token."
    );
  }
  return sessionRecord.userId;
};

export default getUserIdFromSessionToken;
