import prisma from "@/app/libs/prismadb";
import { BadRequestError, NotFoundError } from "../libs/errors";

const getSession = async (sessionToken: string) => {
  if (!sessionToken) {
    throw new BadRequestError("Missing required fields: sessionToken.");
  }

  const sessionRecord = await prisma.session.findUnique({
    where: {
      sessionToken: sessionToken,
    },
  });

  if (!sessionRecord) {
    throw new NotFoundError("No session found for the provided token");
  }

  return sessionRecord;
};

export default getSession;
