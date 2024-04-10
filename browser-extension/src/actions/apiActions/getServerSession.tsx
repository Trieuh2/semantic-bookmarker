const getServerSession = async (sessionToken: string) => {
  try {
    if (!sessionToken) {
      throw new Error("Session ID is required");
    }

    const url = `http://localhost:3000/api/session?sessionToken=${sessionToken}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sessionRecord = response.json();
    return sessionRecord;
  } catch (error) {
    console.error("Failed to fetch server session:", error);
    throw error;
  }
};

export default getServerSession;
