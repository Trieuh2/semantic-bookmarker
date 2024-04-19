const getCollections = async (sessionToken: string, userId: string) => {
  try {
    if (!sessionToken || !userId) {
      throw new Error("All parameters (sessionToken, userId) are required");
    }

    const base_url = "http://localhost:3000/api/collection";
    const params = {
      sessionToken: sessionToken,
      userId: userId,
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `${base_url}?${queryString}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.log("Error fetching collections:", error);
    return null;
  }
};

export default getCollections;
