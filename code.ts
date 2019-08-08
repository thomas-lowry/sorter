figma.showUI(__html__, {width: 240, height: 176 });

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

//organize nodes into arrays based on common parent
function organizeNodesByParent(nodes) {
	let groupedNodes = nodes.reduce((acc, item) => {
		if (!acc[item.parent.id]) {
			acc[item.parent.id] = [];
		}
		acc[item.parent.id].push(item);
		return acc;
	}, {});
	console.log(groupedNodes);
	return groupedNodes;
}



figma.ui.onmessage = msg => {

	let selection = Array.from(figma.currentPage.selection);
	let sortOrder = msg.order;

	if (selection.length <= 1) {
		alert('Please select at least 2 layers');
	}

	let organizedNodes = organizeNodesByParent(selection);

	Object.keys(organizedNodes).forEach((group) => {

		let item = group.toString();
		let groupedNodes = organizedNodes[item];

		let orderedNodes = [];
		let parent = organizedNodes[item][0].parent;

		if (sortOrder == 'sortPosition') {
			orderedNodes = sortPosition(groupedNodes);
		} else if (sortOrder == 'sortAlphaAsc') {
			orderedNodes = sortAlpha(groupedNodes, 'asc');
		} else if (sortOrder == 'sortAlphaDesc') {
			orderedNodes = sortAlpha(groupedNodes, 'desc');
		} else if (sortOrder == 'sortReverse') {
			orderedNodes = sortReverse(groupedNodes);
		} else { 
			orderedNodes = sortRandom(groupedNodes);
		}

		orderedNodes.forEach(node => {
			parent.appendChild(node);
		});

	});

};
