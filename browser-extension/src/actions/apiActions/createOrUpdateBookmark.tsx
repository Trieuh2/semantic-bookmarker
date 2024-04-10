const createOrUpdateBookmark = async (
  title: string,
  page_url: string,
  note: string,
  excerpt: string,
  userId: string,
  sessionToken: string
) => {
  try {
    if (!sessionToken) {
      throw new Error("Session ID is required");
    }

    const postData = {
      title: title,
      page_url: page_url,
      note: note,
      excerpt: excerpt,
      userId: userId,
      sessionToken: sessionToken,
    };
    const api_url = "http://localhost:3000/api/bookmark";
    const response = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to create or update bookmark:", error);
    throw error;
  }
};

export default createOrUpdateBookmark;
