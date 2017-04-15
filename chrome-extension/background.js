
const ID_SEARCH_AT_GOOGLE = "search-at-google";

const createContextMenu = () => {
	chrome.contextMenus.create({
		title: "リンクテキストでグーグル検索",
		contexts: ["link"],
		documentUrlPatterns: [
			"http://*/*",
			"https://*/*",
			"file:///*"
		],
		id: ID_SEARCH_AT_GOOGLE
	});
};

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === ID_SEARCH_AT_GOOGLE) {
		const linkUrl = info.linkUrl;
		const activeTabId = tab.id;
		const frameId = info.frameId;

		// permissionsにURL or activeTabが必要
		chrome.tabs.executeScript(activeTabId, {
			frameId,
			file: "search_link_texts.js"
		}, () => {
			chrome.tabs.sendMessage(activeTabId, {
				method: "searchLinkTexts",
				linkUrl
			}, {frameId});
		});
	}
});

const generateSearchUrl = searchWord => {
	const queryObject = {
		hl: "ja",
		complete: 0,
		q: searchWord
	};
	const querys = Object.entries(queryObject).map(([key, value]) => {
		return `${key}=${encodeURIComponent(value)}`;
	});
	const queryString = querys.join("&");

	const url = `https://www.google.co.jp/search?${queryString}`;
	return url;
};

chrome.runtime.onMessage.addListener((request, sender) => {
	if (request.method === "linkTexts") {
		const linkTexts = request.texts;
		// とりあえず既存の動作（1件目）に合わせる
		const linkText = linkTexts[0];
		const searchUrl = generateSearchUrl(linkText);
		chrome.tabs.create({
			url: searchUrl,
			openerTabId: sender.tab.id // chrome.tabs.onCreatedのloadingでは時差がある
		});
	}
});
