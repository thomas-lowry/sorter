//import styles
import style from './css/ui.css';

//variables
var sortButtons = Array.from(document.getElementsByClassName('sort-button'));
var sortChildren = document.getElementById('sortChildren');

//reieve msgs from plugin code
window.onmessage = async (event) => {
	if (event.data.pluginMessage.sortChildrenOnly === 'true') {
		sortChildren.checked = true;
	}
}

//run plugin
sortButtons.forEach((button) => {
	button.addEventListener('click', function() {
		let sortOrder = this.id;
		let childrenSelected = sortChildren.checked;
		parent.postMessage({ pluginMessage: { 'order': sortOrder, 'children': childrenSelected } }, '*');
	});
});