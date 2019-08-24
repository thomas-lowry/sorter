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

// This function takes the selection, and builds a new array of arrays that are grouped by nodes that share the same parent
// This allows us to sort those layers in context of their parent, and then re-insert them into the parent node
// This function is then used buy the sorting functions to sort each group individually by the sort order chosen by the user
function organizeNodesByParent(nodes) {
	let groupedNodes = nodes.reduce((r, a) => {
		r[a.parent.id] = [...r[a.parent.id] || [], a];
		return r;
		}, {});
	return groupedNodes;
}

// This function returns the number of layers from top of layer stack
// We need this to figure out the index in which we will reinsert the sorted children back into the layer stack
function findDistanceFromTop(nodes, children) {
	let indexes = [];
	let newChildren = [];

	//build array of index of matches elements
	children.forEach(child => {
		nodes.forEach(node => {
			if (child.id === node.id) {
				let index = children.findIndex(x => x.id ===node.id);
				indexes.push(index);
			}
		});
	})

	//sort array of indexes to find the larest
	indexes.sort(function(node1, node2) {
		if (node1 > node2) return 1;
		if (node1 < node2) return -1;
	});

	let topMostIndex = indexes[indexes.length - 1];
	let numOfLayersFromTop = (children.length - 1) - topMostIndex;

	return numOfLayersFromTop;
}

// This function will remove the duplicate nodes between the selection and the matches
// that exist in the parent node
// we need to do this because the selection data from Figma doesnot guarantee 
// that they will be in the same order as they arewithin the array of children
function removeDuplicates(nodes, children) {
	let newChildren = children.filter(function(c){
		return !nodes.find(function(n){
			return n.id == c.id;
		});
	});
	return newChildren;
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

			let parent = parentNode;
			let childNodes = parent.children;

			if (childNodes != undefined) {

				if (childNodes.length <= 1) {
					figma.notify('Parent must contain at least 2 children');
					return;
				}

				let orderedNodes = [];
				childNodes = Array.from(childNodes);


				if (sortOrder == 'sortPosition') {
					orderedNodes = sortPosition(childNodes);
				} else if (sortOrder == 'sortAlphaAsc') {
					orderedNodes = sortAlpha(childNodes, 'asc');
				} else if (sortOrder == 'sortAlphaDesc') {
					orderedNodes = sortAlpha(childNodes, 'desc');
				} else if (sortOrder == 'sortReverse') {
					orderedNodes = sortChildrenReverse(childNodes);
				} else { 
					orderedNodes = sortRandom(childNodes);
				}

				orderedNodes.forEach(node => {
					parent.appendChild(node);
				});
			}
		});

	} else {

		if (selection.length <= 1) {
			figma.notify('Please select at least 2 layers');
			return;
		}
	
		let organizedNodes = organizeNodesByParent(selection);
	
		Object.entries(organizedNodes).forEach(entries => {
	
			entries.forEach(entry => {
				if (Array.isArray(entry)) {
	
					let orderedNodes = [];
					let parent = entry[0].parent
					let children = parent.children;
					let distanceFromTop = findDistanceFromTop(entry, children);
					let childrenWithNoDuplicates = removeDuplicates(entry, children);
	
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

					let newChildArr = [];
					let indexToSpliceAt = childrenWithNoDuplicates.length - distanceFromTop;
					let topNodes = childrenWithNoDuplicates.splice(indexToSpliceAt);
					
					childrenWithNoDuplicates.forEach(node => {
						newChildArr.push(node);
					})

					orderedNodes.forEach(node => {
						newChildArr.push(node);
					})

					topNodes.forEach(node => {
						newChildArr.push(node);
					})

					newChildArr.forEach(child => {
						parent.appendChild(child);
					})
				}
			})
		});
	}
};
