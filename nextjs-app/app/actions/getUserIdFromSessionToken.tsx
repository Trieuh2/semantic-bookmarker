import prisma from "@/app/libs/prismadb";

const getUserIdFromSessionToken = async (sessionToken: string) => {
  try {
    const sessionRecord = await prisma?.session.findFirst({
      where: {
        sessionToken,
      },
    });

    if (!sessionRecord) {
      return { status: 404, error: "Session record not found" };
    } else {
      return { status: 200, data: sessionRecord.userId };
    }
  } catch (error) {
    return { status: 500, error: "Internal Server Error" };
  }
};

export default getUserIdFromSessionToken;
