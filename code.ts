figma.showUI(__html__, {width: 240, height: 228 });

//get plugin data to remember last settings for subsequent plugin runs
var sortChildrenSetting = figma.root.getPluginData('sortChildrenOnly');

if (sortChildrenSetting) {
	figma.ui.postMessage({
		'sortChildrenOnly': sortChildrenSetting
	});
}

//
// Ordering functions
//

//sort the stack order by top to bottom, left to right
function sortPosition(nodeData) {

	nodeData.sort(function(node1, node2) {
		if (node1.y < node2.y) return 1;
		if (node1.y > node2.y) return -1;
		if (node1.x < node2.x) return 1;
		if (node1.x > node2.x) return -1;
	});

	return nodeData;

}

//sort the stack order alphabetically, ascending or descending
function sortAlpha(nodeData, direction) {

	nodeData.sort(function(node1, node2) {
		if (node1.name < node2.name) return 1;
		if (node1.name > node2.name) return -1;
	});

	switch (direction) {
		case "asc":
			return nodeData;
			break;
		case "desc":
			nodeData = nodeData.reverse();
			return nodeData;
			break;		
	}

}

//reverse the stack order of selection
function sortReverse(nodeData) {
	let parentNode = nodeData[0].parent;
	let children = parentNode.children;
	children = children.filter(function(entry1) {
		return nodeData.some(function(entry2) { return entry1.id === entry2.id; });
	});
	children.reverse();

	return children;
}
function sortChildrenReverse(nodeData) {
	nodeData = nodeData.reverse();
	return nodeData;
}


//randomize the stack order
function sortRandom(nodeData) {
	for (let i = nodeData.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[nodeData[i], nodeData[j]] = [nodeData[j], nodeData[i]];
	}
	return nodeData;
}




//
// Helper functions
//
function organizeNodesByParent(nodes) {
	let groupedNodes = nodes.reduce((r, a) => {
		r[a.parent.id] = [...r[a.parent.id] || [], a];
		return r;
		}, {});
	return groupedNodes;
}



figma.ui.onmessage = msg => {

	let selection = Array.from(figma.currentPage.selection);
	
	//get values from UI
	let sortOrder = msg.order;
	let children = msg.children;

	//set plugin data
	figma.root.setPluginData('sortChildrenOnly', children.toString());

	if (children === true) {

		selection.forEach(parentNode => {

			let children = Array.from(parentNode.children);

			if (children.length != 0) {

				let parent = parentNode;
				let orderedNodes = [];

				if (sortOrder == 'sortPosition') {
					orderedNodes = sortPosition(children);
				} else if (sortOrder == 'sortAlphaAsc') {
					orderedNodes = sortAlpha(children, 'asc');
				} else if (sortOrder == 'sortAlphaDesc') {
					orderedNodes = sortAlpha(children, 'desc');
				} else if (sortOrder == 'sortReverse') {
					orderedNodes = sortChildrenReverse(children);
				} else { 
					orderedNodes = sortRandom(children);
				}

				orderedNodes.forEach(node => {
					parent.appendChild(node);
				});
			}
		});

	} else {

		if (selection.length <= 1) {
			alert('Please select at least 2 layers');
		}
	
		let organizedNodes = organizeNodesByParent(selection);
	
		Object.entries(organizedNodes).forEach(entries => {
	
			entries.forEach(entry => {
				if (Array.isArray(entry)) {
	
					let orderedNodes = [];
					let parent = entry[0].parent;
	
					if (sortOrder == 'sortPosition') {
						orderedNodes = sortPosition(entry);
					} else if (sortOrder == 'sortAlphaAsc') {
						orderedNodes = sortAlpha(entry, 'asc');
					} else if (sortOrder == 'sortAlphaDesc') {
						orderedNodes = sortAlpha(entry, 'desc');
					} else if (sortOrder == 'sortReverse') {
						orderedNodes = sortReverse(entry);
					} else { 
						orderedNodes = sortRandom(entry);
					}
	
					orderedNodes.forEach(node => {
						parent.appendChild(node);
					});
				}
			})
		});
	}
};
