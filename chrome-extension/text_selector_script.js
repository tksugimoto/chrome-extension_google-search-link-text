
chrome.storage.local.get({
	textSelectorData: {},
}, result => {
	const {
		linkTexts = [],
		returnMessageBase = {},
	} = result.textSelectorData;

	const list_container = document.getElementById('list_container');

	if (linkTexts.length === 0) {
		window.close();
		return;
	}
	linkTexts.forEach(linkText => {
		const listItem = document.createElement('li');

		const selectButton = document.createElement('button');
		selectButton.classList.add('select-button');
		selectButton.append(linkText);
		selectButton.addEventListener('click', () => {
			const message = Object.assign({}, returnMessageBase, {
				text: linkText,
			});
			chrome.runtime.sendMessage(message);
			window.close();
		});

		listItem.append(selectButton);
		list_container.append(listItem);
	});
});

document.getElementById('close').addEventListener('click', () => {
	window.close();
});

document.body.addEventListener('keydown', evt => {
	if (evt.key === 'Escape') {
		window.close();
	}
});
