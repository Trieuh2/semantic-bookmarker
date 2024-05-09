// SIMPLE RELOADER IMPORT
              import "./assets/background-page-reloader-47a6fffc.js"
              import { a as apiUpdateBookmark, b as apiDeleteBookmark } from './bookmarkAPI-42b2d83e.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.action === "updateBookmark") {
        apiUpdateBookmark(message?.data).catch((error) => console.error("Semantic Bookmarker: Error updating bookmark", error));
    }
    if (message?.action === "deleteBookmark") {
        apiDeleteBookmark(message?.data).catch((error) => console.error("Semantic Bookmarker: Error deleting bookmark", error));
    }
});//# sourceMappingURL=service-worker.js.map
