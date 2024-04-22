import prisma from "@/app/libs/prismadb";
import { BadRequestError, NotFoundError } from "../../libs/errors";

const getSession = async (sessionToken: string) => {
  if (!sessionToken) {
    throw new BadRequestError(
      "Error fetching session. Missing required field: sessionToken."
    );
  }

  const sessionRecord = await prisma.session.findUnique({
    where: {
      sessionToken,
    },
  });

  if (!sessionRecord) {
    throw new NotFoundError(
      "Error fetching session. No session found for the provided token."
    );
  }

  return sessionRecord;
};

export default getSession;
