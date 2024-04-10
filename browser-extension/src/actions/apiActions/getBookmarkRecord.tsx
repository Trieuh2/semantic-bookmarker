const getBookmarkRecord = async (
  sessionToken: string,
  userId: string,
  page_url: string
) => {
  try {
    if (!sessionToken) {
      throw new Error("Session ID is required");
    }
    if (!userId) {
      throw new Error("userId is required");
    }
    if (!page_url) {
      throw new Error("url is required");
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookmarkRecord = response.json();
    return bookmarkRecord;
  } catch (error) {
    throw error;
  }
};

export default getBookmarkRecord;
