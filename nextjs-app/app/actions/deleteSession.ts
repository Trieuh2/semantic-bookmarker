import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "./getIsSessionValid";
import { Session } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../libs/errors";
import getSession from "./getSession";

const deleteSession = async (sessionToken: string): Promise<Session> => {
  if (!sessionToken) {
    throw new BadRequestError("Missing required fields (sessionToken)");
  }

  // Check if the session exists before deletion to handle not found error gracefully
  const session = await getSession(sessionToken);

  if (!session) {
    throw new NotFoundError("Session not found.");
  }

  // If bookmark exists, proceed with deletion
  const deletedSession = await prisma.session.delete({
    where: {
      sessionToken,
    },
  });

  if (!deletedSession) {
    throw new Error("Error deleting Session record.");
  }
  return deletedSession;
};

export default deleteSession;
