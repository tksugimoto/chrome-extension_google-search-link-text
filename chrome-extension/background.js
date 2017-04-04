
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
		
		const content_script = () => {
			const elems = document.getElementsByTagName("a");
			for (let i = 0, len = elems.length; i < len; i++) {
				const elem = elems[i];
				if (elem.innerText.replace(/\s/g, "")
				 && elem.href === "linkUrl") {
					chrome.runtime.sendMessage({
						"method": "search",
						"text": elem.innerText
					});
					break;
				}
			}
		};
		// permissionsにURL or activeTabが必要
		chrome.tabs.executeScript(null, {
			"code": "(" + content_script.toString().replace("linkUrl", linkUrl) + ")()"
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
	if (request.method === "search") {
		const text = request.text;
		const searchUrl = generateSearchUrl(text);
		chrome.tabs.create({
			url: searchUrl,
			openerTabId: sender.tab.id // chrome.tabs.onCreatedのloadingでは時差がある
		});
	}
});