
const {
	linkTexts = [],
	returnMessageBase = {}
} = JSON.parse(localStorage.textSelectorData || "{}");

const list_container = document.getElementById("list_container");

if (linkTexts.length === 0) {
	window.close();
} else {
	linkTexts.forEach(linkText => {
		const listItem = document.createElement("li");

		const selectButton = document.createElement("button");
		selectButton.classList.add("select-button");
		selectButton.append(linkText);
		selectButton.addEventListener("click", () => {
			const message = Object.assign({}, returnMessageBase, {
				text: linkText
			});
			chrome.runtime.sendMessage(message);
			window.close();
		});

		listItem.append(selectButton);
		list_container.append(listItem);
	});
}

document.getElementById("close").addEventListener("click", () => {
	window.close();
});
