import getSessionRecord from "./getSessionRecord";

const getIsSessionValid = async (sessionToken: string) => {
  const nowTimestamp = Date.now();
  const nowDate = new Date(nowTimestamp);
  const sessionRecord = await getSessionRecord(sessionToken);

  if (!sessionRecord || sessionRecord?.expires > nowDate) {
    return false;
  } else {
    return true;
  }
};

export default getIsSessionValid;
