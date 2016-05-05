

chrome.contextMenus.create({
	title: "リンクテキストでグーグル検索",
	contexts: ["link"],
	documentUrlPatterns: [
		"http://*/*",
		"https://*/*",
		"file:///*"
	],
	onclick: function (info, tab){
		var linkUrl = info.linkUrl;
		
		function content_script(){
			var elems = document.getElementsByTagName("a");
			for (var i = 0, len = elems.length; i < len; i++) {
				var elem = elems[i];
				if (elem.innerText.replace(/\s/g, "")
				 && elem.href === "linkUrl") {
					chrome.runtime.sendMessage({
						"method": "search",
						"text": elem.innerText
					});
					break;
				}
			}
		}
		// permissionsにURL or activeTabが必要
		chrome.tabs.executeScript(null, {
			"code": "(" + content_script.toString().replace("linkUrl", linkUrl) + ")()"
		});
	}
});

chrome.runtime.onMessage.addListener(function (request, sender) {
	if (request.method === "search") {
		var text = request.text;
		var url = "https://www.google.co.jp/search?hl=ja&complete=0&q=" + encodeURIComponent(text);
		chrome.tabs.create({
			url: url,
			openerTabId: sender.tab.id // chrome.tabs.onCreatedのloadingでは時差がある
		});
	}
});
