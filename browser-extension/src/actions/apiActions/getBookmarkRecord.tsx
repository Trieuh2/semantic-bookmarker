const getBookmarkRecord = async (
  sessionToken: string,
  userId: string,
  page_url: string
) => {
  try {
    if (!sessionToken || !userId || !page_url) {
      throw new Error(
        "All parameters (sessionToken, userId, page_url) are required"
      );
    }

    const base_url = "http://localhost:3000/api/bookmark";
    const params = {
      sessionToken: sessionToken,
      userId: userId,
      page_url: page_url,
    };
    const queryString = new URLSearchParams(params).toString();
    const api_url = `${base_url}?${queryString}`;

    const response = await fetch(api_url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookmarkRecord = response.json();
    return bookmarkRecord;
  } catch (error) {
    console.error("Error fetching bookmark record:", error);
    return null;
  }
};

export default getBookmarkRecord;
