interface BookmarkUpdateRequest {
  id: string;
  sessionToken: string;
  title?: string;
  page_url?: string;
  note?: string;
  excerpt?: string;
}

const updateBookmark = async (updateRequest: BookmarkUpdateRequest) => {
  try {
    const { id, sessionToken } = updateRequest;

    if (!id || !sessionToken) {
      throw Error("Missing required fields (id, sessionToken)");
    }

    const url = "http://localhost:3000/api/bookmark";
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to update bookmark: ", error);
    throw error;
  }
};

export default updateBookmark;
