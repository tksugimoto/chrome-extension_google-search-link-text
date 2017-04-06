(() => {
	if (window.isAlreadyPrepared) return;
	window.isAlreadyPrepared = true;

	const searchLinkText = linkUrl => {
		const elems = document.getElementsByTagName("a");
		for (let i = 0, len = elems.length; i < len; i++) {
			const elem = elems[i];
			if (elem.innerText.replace(/\s/g, "")
			 && elem.href === linkUrl) {
			 	return elem.innerText
			}
		}
	};
	chrome.runtime.onMessage.addListener(request => {
		if (request.method === "searchLinkText") {
			const linkText = searchLinkText(request.linkUrl);
			chrome.runtime.sendMessage({
				"method": "search",
				"text": linkText
			});
		}
	});
})();
