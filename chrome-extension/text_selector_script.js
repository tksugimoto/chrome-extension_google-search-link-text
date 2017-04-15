
const linkTexts = JSON.parse(localStorage.linkTexts || "[]");
const method = localStorage.method;
const opts = JSON.parse(localStorage.opts || "{}");
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
			chrome.runtime.sendMessage({
				method,
				opts,
				text: linkText
			});
			window.close();
		});

		listItem.append(selectButton);
		list_container.append(listItem);
	});
}
