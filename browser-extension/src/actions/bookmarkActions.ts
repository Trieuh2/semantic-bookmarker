import { BookmarkCreateRequest } from "../types";
import {
  apiCreateBookmark as apiAddBookmark,
  apiFetchBookmark,
} from "./apiActions/bookmarkAPI";

export const fetchBookmark = async (
  sessionToken: string,
  page_url: string
) => {
  try {
    const response = await apiFetchBookmark(sessionToken, page_url);
    if (response && response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
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
