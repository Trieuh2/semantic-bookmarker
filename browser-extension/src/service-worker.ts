import { debounce } from "lodash";
import {
  apiDeleteBookmark,
  apiUpdateBookmark,
} from "./actions/apiActions/bookmarkAPI";
import { BookmarkUpdateRequest } from "./types";

const debouncedUpdateBookmarkAPI = debounce((data: BookmarkUpdateRequest) => {
  apiUpdateBookmark(data).catch((error) =>
    console.error("Semantic Bookmarker: Error updating bookmark", error)
  );
}, 500);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === "updateBookmark") {
    debouncedUpdateBookmarkAPI(message?.data);
  }
  if (message?.action === "deleteBookmark") {
    apiDeleteBookmark(message?.data);
  }
});
