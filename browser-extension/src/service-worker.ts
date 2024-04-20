import { debounce } from "lodash";

interface BookmarkUpdateRequest {
  id: string;
  sessionToken: string;
  title?: string;
  page_url?: string;
  note?: string;
  excerpt?: string;
}

interface BookmarkDeleteRequest {
  sessionToken: string;
  userId: string;
  id: string;
}

async function updateBookmarkAPI(data: BookmarkUpdateRequest) {
  return fetch("http://localhost:3000/api/bookmark", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

const debouncedUpdateBookmarkAPI = debounce((data: BookmarkUpdateRequest) => {
  updateBookmarkAPI(data).catch((error) =>
    console.error("Semantic Bookmarker: Error updating bookmark", error)
  );
}, 500);

async function deleteBookmarkAPI(data: BookmarkDeleteRequest) {
  return fetch("http://localhost:3000/api/bookmark", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === "updateBookmark") {
    debouncedUpdateBookmarkAPI(message?.data);
  }
  if (message?.action === "deleteBookmark") {
    deleteBookmarkAPI(message?.data)
      .then((response) => console.log("Bookmark deletion successful", response))
      .catch((error) => console.log("Failed to delete bookmark:", error));
  }
});
