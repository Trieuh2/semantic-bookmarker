import prisma from "@/app/libs/prismadb";
import { Session } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../libs/errors";
import getSession from "./getSession";

const deleteSession = async (sessionToken: string): Promise<Session> => {
  if (!sessionToken) {
    throw new BadRequestError(
      "Error encountered during Session deletion. Missing required fields (sessionToken)"
    );
  }

  // Check if the session exists before deletion to handle not found error gracefully
  const session = await getSession(sessionToken);

  if (!session) {
    throw new NotFoundError(
      "Error encountered during Session deletion. Session not found."
    );
  }

  // If bookmark exists, proceed with deletion
  const deletedSession = await prisma.session.delete({
    where: {
      sessionToken,
    },
  });

  if (!deletedSession) {
    throw new Error(
      "Error encountered during Session deletion. Internal Server Error."
    );
  }
  return deletedSession;
};

export default deleteSession;
