

chrome.contextMenus.create({
	title: "リンクテキストでグーグル検索",
	contexts: ["link"],
	onclick: function (info, tab){
		var linkUrl = info.linkUrl;
		
		function content_script(){
			var elems = document.getElementsByTagName("a");
			for (var i = 0, len = elems.length; i < len; i++) {
				var elem = elems[i];
				if (elem.getElementsByTagName("img").length === 0 && elem.innerText && elem.href === "linkUrl") {
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
}, function (){});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.method === "search") {
		var text = request.text;
		var url = "https://www.google.co.jp/search?hl=ja&complete=0&q=" + text;
		chrome.tabs.create({
			url: url,
			openerTabId: sender.tab.id // chrome.tabs.onCreatedのloadingでは時差がある
		}, function (){});
	}
});