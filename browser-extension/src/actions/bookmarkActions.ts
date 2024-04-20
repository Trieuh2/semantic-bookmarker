import {
  apiCreateBookmark as apiAddBookmark,
  apiFetchBookmark,
} from "./apiActions/bookmarkAPI";

interface BookmarkCreateRequest {
  userId: string;
  sessionToken: string;
  title: string;
  page_url: string;
  note?: string;
  excerpt?: string;
  collection_name: string;
}

export const fetchBookmark = async (
  userId: string,
  sessionToken: string,
  page_url: string
) => {
  try {
    const response = await apiFetchBookmark(userId, sessionToken, page_url);
    if (response && response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    // console.error(
    //   "Error fetching bookmark record:",
    //   error instanceof Error ? error.message : "An unexpected error occurred"
    // );
    return null;
  }
};

export const addBookmark = async (createRequest: BookmarkCreateRequest) => {
  try {
    const response = await apiAddBookmark(createRequest);
    if (response && response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Error creating bookmark record:",
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
    return null;
  }
};
