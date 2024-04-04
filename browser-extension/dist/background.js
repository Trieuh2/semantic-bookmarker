function init() {
    console.log("content script");
}

// This file must be in the root of the src directory
chrome.action.onClicked.addListener((tab) => {
    if (tab && tab.id) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: init,
        });
    }
});
