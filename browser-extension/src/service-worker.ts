import {
  apiDeleteBookmark,
  apiUpdateBookmark,
} from "./actions/apiActions/bookmarkAPI";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === "updateBookmark") {
    apiUpdateBookmark(message?.data).catch((error) =>
      console.error("Semantic Bookmarker: Error updating bookmark", error)
    );
  }
  if (message?.action === "deleteBookmark") {
    apiDeleteBookmark(message?.data).catch((error) =>
      console.error("Semantic Bookmarker: Error deleting bookmark", error)
    );;
  }
});
