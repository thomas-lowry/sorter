import helpers from './helpers';

function alphabetical(nodeData, direction) {

	nodeData.sort(helpers.naturalCompare);

	switch (direction) {
		case "asc":
			return nodeData;
			break;
		case "dsc":
			nodeData = nodeData.reverse();
			return nodeData;
			break;		
	}
}


// POSITION
//sorts nodes based on x,y position
function position(nodeData) {
	nodeData.sort(function(node1, node2) {
		if (node1.y < node2.y) return 1;
		if (node1.y > node2.y) return -1;
		if (node1.x < node2.x) return 1;
		if (node1.x > node2.x) return -1;
	});
	return nodeData;
}

//RANDOM
//randomize the stack order
function random(nodeData) {
	for (let i = nodeData.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[nodeData[i], nodeData[j]] = [nodeData[j], nodeData[i]];
	}
	return nodeData;
}

//REVERSE
//reverse the stack order of selection
function reverse(nodeData) {
	let parentNode = nodeData[0].parent;
	let children = parentNode.children;
	children = children.filter(function(entry1) {
		return nodeData.some(function(entry2) { return entry1.id === entry2.id; });
	});
	children.reverse();
	return children;
}
function reverseChildren(nodeData) {
	nodeData = nodeData.reverse();
	return nodeData;
}

export default { alphabetical, position, random, reverse, reverseChildren };