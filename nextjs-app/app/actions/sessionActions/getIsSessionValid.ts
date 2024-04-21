import getSession from "./getSession";

const getIsSessionValid = async (sessionToken: string): Promise<boolean> => {
  if (!sessionToken) {
    return false;
  }

  const nowTimestamp = Date.now();
  const nowDate = new Date(nowTimestamp);

  const sessionRecord = await getSession(sessionToken);

  if (!sessionRecord) {
    return false; // No session record from DB to validate with, return False
  }

  if (sessionRecord?.expires > nowDate) {
    return true; // Session is still valid
  }

  return false; // Session has expired
};

export default getIsSessionValid;
