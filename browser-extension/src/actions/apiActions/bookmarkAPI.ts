import {
  Bookmark,
  BookmarkCreateRequest,
  BookmarkDeleteRequest,
  BookmarkUpdateRequest,
} from "../../types";

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const apiFetchBookmark = async (
  sessionToken: string,
  page_url: string
): Promise<APIResponse<Bookmark> | null> => {
  if (!sessionToken || !page_url) {
    throw new Error(
      "All parameters (sessionToken, page_url) are required"
    );
  }

  const base_url = "http://localhost:3000/api/bookmark";
  const params = {
    page_url: page_url,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `${base_url}?${queryString}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${sessionToken}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = (await response.json()) as APIResponse<Bookmark>;
  if (!data.success) {
    throw new Error(data.error || "Unknown error occurred");
  }

  return data;
};

const apiCreateBookmark = async (
  createRequest: BookmarkCreateRequest
): Promise<APIResponse<Bookmark> | null> => {
  const {
    userId,
    sessionToken,
    title,
    page_url,
    note,
    excerpt,
    collection_name,
  } = createRequest;

  if (!userId || !sessionToken || !title || !page_url) {
    throw Error(
      "Missing required fields (userId, sessionToken, title, page_url)."
    );
  }

  const postData = {
    userId: userId,
    sessionToken: sessionToken,
    title: title,
    page_url: page_url,
    note: note ?? "",
    excerpt: excerpt ?? "",
    collection_name: collection_name ?? "Unsorted",
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

  const data = (await response.json()) as APIResponse<Bookmark>;
  if (!data.success) {
    throw new Error(data.error || "Unknown error occurred");
  }

  return data;
};

const apiUpdateBookmark = async (updateRequest: BookmarkUpdateRequest) => {
  const { sessionToken, id } = updateRequest;

  if (!sessionToken || !id) {
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

  const data = (await response.json()) as APIResponse<Bookmark>;
  if (!data.success) {
    throw new Error(data.error || "Unknown error occurred");
  }

  return data;
};

const apiDeleteBookmark = async (deleteRequest: BookmarkDeleteRequest) => {
  return fetch("http://localhost:3000/api/bookmark", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deleteRequest),
  });
};

export {
  apiFetchBookmark,
  apiCreateBookmark,
  apiUpdateBookmark,
  apiDeleteBookmark,
};
