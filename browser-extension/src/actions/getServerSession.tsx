const getServerSession = async (sessionId: string) => {
  try {
    if (!sessionId) {
      return null;
    }

    const url = `http://localhost:3000/api/session?sessionToken=${sessionId}`;
    const response = await fetch(url);
    const sessionRecord = response.json();
    return sessionRecord;
  } catch (error) {
    return null;
  }
};

export default getServerSession;
