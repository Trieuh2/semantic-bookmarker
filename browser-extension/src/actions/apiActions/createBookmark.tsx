interface BookmarkCreateRequest {
  title: string;
  page_url: string;
  note?: string;
  excerpt?: string;
  collection_name: string;
  userId: string;
  sessionToken: string;
}

const createBookmark = async (createRequest: BookmarkCreateRequest) => {
  try {
    const {
      title,
      page_url,
      note,
      excerpt,
      collection_name,
      userId,
      sessionToken,
    } = createRequest;

    if (!title || !page_url || !userId || !sessionToken) {
      throw Error(
        "Missing required fields (title, page_url, userId, sessionToken)."
      );
    }

    const postData = {
      title: title,
      page_url: page_url,
      note: note ?? "",
      excerpt: excerpt ?? "",
      collection_name: collection_name ?? "Unsorted",
      userId: userId,
      sessionToken: sessionToken,
    };
    const url = "http://localhost:3000/api/bookmark";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to create or update bookmark:", error);
    throw error;
  }
};

export default createBookmark;
