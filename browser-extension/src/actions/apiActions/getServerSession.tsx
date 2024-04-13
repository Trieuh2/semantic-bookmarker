const getServerSession = async (sessionToken: string) => {
  try {
    if (!sessionToken) {
      throw new Error("Session token is required!");
    }

    const url = `http://localhost:3000/api/session?sessionToken=${sessionToken}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) {
        return null;
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sessionRecord = response.json();
    return sessionRecord;
  } catch (error) {
    console.error("Failed to fetch server session:", error);
    return null;
  }
};

export default getServerSession;
