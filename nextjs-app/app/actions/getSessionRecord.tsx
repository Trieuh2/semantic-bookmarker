import prisma from "@/app/libs/prismadb";
import { SessionError } from "../types";

const getSessionRecord = async (sessionToken: string) => {
  try {
    if (!sessionToken) {
      throw new SessionError("Session token is required", "MISSING_TOKEN");
    }

    const sessionRecord = await prisma.session.findUnique({
      where: {
        sessionToken: sessionToken,
      },
    });

    if (!sessionRecord) {
      throw new SessionError(
        "No session found for the provided token",
        "NOT_FOUND"
      );
    }

    return sessionRecord;
  } catch (error) {
    console.log("Error accessing the database:", error);
    return null;
  }
};

export default getSessionRecord;
