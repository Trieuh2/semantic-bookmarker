import prisma from "@/app/libs/prismadb";

const getSessionRecord = async (sessionToken: string) => {
  try {
    if (sessionToken === null || sessionToken === "") {
      return null;
    }

    // Fetch the Session record from the DB
    const sessionRecord = await prisma.session.findUnique({
      where: {
        sessionToken: sessionToken,
      },
    });

    if (sessionRecord !== null) {
      return sessionRecord;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getSessionRecord;
