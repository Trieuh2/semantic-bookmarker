import { BadRequestError } from "@/app/libs/errors";
import getSession from "./getSession";

const getIsSessionValid = async (sessionToken: string): Promise<boolean> => {
  if (!sessionToken) {
    throw new BadRequestError(
      "Error validating session. Missing required fields: sessionToken."
    );
  }

  const nowTimestamp = Date.now();
  const nowDate = new Date(nowTimestamp);

  try {
    const sessionRecord = await getSession(sessionToken);
    if (sessionRecord?.expires > nowDate) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching session record for validation.", error);
    return false; // No session record from DB to validate with, return False
  }
};

export default getIsSessionValid;
