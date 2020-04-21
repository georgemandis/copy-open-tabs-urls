/**
 * Copy open tab URLs to the clipboard
 * ===
 * George Mandis (george@mand.is)
 * https://george.mand.is
 */

// kind of feels like a strange hack but I guess
// this is how a Chrome extension copies text to
// the clipboard in the background?
const text = document.createElement("textarea");
document.body.append(text);

function getCurrentTabs() {
  chrome.tabs.getAllInWindow(async (tabs) => {
    const urls = tabs.map((value) => value.url);
    text.value = urls.join("\n");
    text.select();
    document.execCommand("copy");
  });
}

chrome.contextMenus.onClicked.addListener(getCurrentTabs);

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Copy open URLs to clipboard",    
    id: "copy-open-urls",
    contexts: ["all"]
  });
});
