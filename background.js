/**
 * 📋 Copy URLs
 * ===
 * Quickly copy URLs from: 
 * - All your open tabs
 * - Links within the currently active tab
 * - Links within a selection of text
 * 
 * George Mandis (george@mand.is)
 * https://george.mand.is
 */

function copyURLsToClipboard(urls) {
  navigator.clipboard.writeText(urls.join("\n"));
}

function removeDuplicateURLs(urls) {
  return [...new Set(urls)];
}

function getLinksOnPage() {
  return Array.from(document.links).map(a => a.href);
}

function getLinksWithingSelection() {
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  const links = range.cloneContents().querySelectorAll("a[href]");
  return Array.from(links).map(a => a.href);
}

async function getURLs(req, sender) {  
  const tabs = await chrome.tabs.query({});
  const activeTab = tabs.find(t => t.active);
  let urls;

  if (req?.menuItemId == "copy-open-tab-urls") {
    urls = tabs.map((value) => value.url);
  }

  if (req?.menuItemId == "copy-link-urls-within-page") {
    urls = (await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: getLinksOnPage
    }))[0].result;
  }

  if (req?.menuItemId == "copy-link-urls-within-selection") {
    urls = (await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: getLinksWithingSelection
    }))[0].result;
  }

  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    function: copyURLsToClipboard,
    args: [removeDuplicateURLs(urls)],
  });

}

/**
 * Add handlers for context menu + action clicks
 */
chrome.contextMenus.onClicked.addListener(getURLs);

/**
 * Add our context menus
 */
chrome.runtime.onInstalled.addListener(function () {
  const mainMenuId = "copy-urls";
  chrome.contextMenus.create({
    title: "Copy URLs to clipboard from...",
    id: mainMenuId,
    contexts: ["page", "action", "selection"]
  });
  chrome.contextMenus.create({
    title: "Links in this selection",
    id: "copy-link-urls-within-selection",
    parentId: mainMenuId,
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    title: "Open tabs in this window",
    id: "copy-open-tab-urls",
    parentId: mainMenuId,
    contexts: ["page", "action", "selection"]
  });
  chrome.contextMenus.create({
    title: "Links on this page",
    id: "copy-link-urls-within-page",
    parentId: mainMenuId,
    contexts: ["page", "action", "selection"]
  });
});
