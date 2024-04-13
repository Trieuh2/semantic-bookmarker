import getSessionRecord from "./getSessionRecord";

const getIsSessionValid = async (sessionToken: string): Promise<boolean> => {
  const nowTimestamp = Date.now();
  const nowDate = new Date(nowTimestamp);

  const sessionRecord = await getSessionRecord(sessionToken);

  if (!sessionRecord) {
    return false; // No session record from DB to validate with, return False
  }

  if (sessionRecord?.expires > nowDate) {
    return true; // Session is still valid
  }

  return false; // Session has expired
};

export default getIsSessionValid;
