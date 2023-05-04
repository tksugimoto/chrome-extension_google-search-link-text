
const ID_SEARCH_AT_GOOGLE = 'search-at-google';

const createContextMenu = () => {
	chrome.contextMenus.create({
		title: 'リンクテキストでグーグル検索 (&S)',
		contexts: ['link'],
		documentUrlPatterns: [
			'http://*/*',
			'https://*/*',
			'file:///*',
		],
		id: ID_SEARCH_AT_GOOGLE,
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
		chrome.scripting.executeScript({
			target: {
				tabId: activeTabId,
				frameIds: [
					frameId,
				],
			},
			files: [
				'search_link_texts.js',
			],
		}, () => {
			chrome.tabs.sendMessage(activeTabId, {
				method: 'searchLinkTexts',
				linkUrl,
			}, {frameId});
		});
	}
});

const generateSearchUrl = searchWord => {
	const queryObject = {
		hl: 'ja',
		complete: 0,
		q: searchWord,
	};
	const querys = Object.entries(queryObject).map(([key, value]) => {
		return `${key}=${encodeURIComponent(value)}`;
	});
	const queryString = querys.join('&');

	const url = `https://www.google.co.jp/search?${queryString}`;
	return url;
};

chrome.runtime.onMessage.addListener((request, sender) => {
	if (request.method === 'selectedLinkText') {
		const linkText = request.text;
		const searchUrl = generateSearchUrl(linkText);
		chrome.tabs.create({
			url: searchUrl,
			openerTabId: request.originalSenderTabid, // chrome.tabs.onCreatedのloadingでは時差がある
		});
	} else if (request.method === 'linkTexts') {
		const linkTexts = request.texts;
		if (linkTexts.length === 1) {
			const linkText = linkTexts[0];
			const searchUrl = generateSearchUrl(linkText);
			chrome.tabs.create({
				url: searchUrl,
				openerTabId: sender.tab.id, // chrome.tabs.onCreatedのloadingでは時差がある
			});
		} else if (linkTexts.length >= 2) {
			chrome.storage.local.set({
				textSelectorData: {
					linkTexts,
					returnMessageBase: {
						method: 'selectedLinkText',
						originalSenderTabid: sender.tab.id,
					},
				},
			}, () => {
				chrome.windows.create({
					url: 'text_selector.html',
					type: 'popup',
					state: 'fullscreen',
				});
			});
		}
	}
});
