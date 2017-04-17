(() => {
	if (window.isAlreadyPrepared) return;
	window.isAlreadyPrepared = true;

	let latestContextMenuTriggeredAnchorElement = null;
	document.addEventListener("contextmenu", evt => {
		if (evt.target.tagName === "A") {
			latestContextMenuTriggeredAnchorElement = evt.target;
		}
	}, /* useCapture = */ true);

	const uniq = array => {
		// 重複を除去する
		return Array.from(new Set(array));
	};

	const searchLinkTexts = linkUrl => {
		const links = document.getElementsByTagName("a");
		return Array.from(links).filter(link => {
			return link.href === linkUrl;
		}).map(link => {
			return link.innerText.trim();
		}).filter(linkText => {
			return linkText;
		});
	};
	chrome.runtime.onMessage.addListener(request => {
		if (request.method === "searchLinkTexts") {
			if (latestContextMenuTriggeredAnchorElement
			 && latestContextMenuTriggeredAnchorElement.href === request.linkUrl
			) {
				const linkText = latestContextMenuTriggeredAnchorElement.innerText.trim();
				if (linkText) {
					chrome.runtime.sendMessage({
						method: "linkTexts",
						texts: [linkText]
					});
					return;
				}
			}
			const linkTexts = searchLinkTexts(request.linkUrl);
			const uniqueLinkTexts = uniq(linkTexts);
			chrome.runtime.sendMessage({
				method: "linkTexts",
				texts: uniqueLinkTexts
			});
		}
	});
})();
