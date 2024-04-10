import prisma from "@/app/libs/prismadb";

const getSessionRecord = async (sessionToken: string) => {
  try {
    if (!sessionToken) {
      return null;
    }

    // Fetch the Session record from the DB
    const sessionRecord = await prisma.session.findUnique({
      where: {
        sessionToken: sessionToken,
      },
    });

    return sessionRecord;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getSessionRecord;
