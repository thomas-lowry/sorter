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

// function to handle natural sorting when sorting alphabetical
function naturalCompare(b, a) {
    var ax = [], bx = [];

    a.name.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b.name.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
    
    while(ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }

    return ax.length - bx.length;
}

//split array if there are fixed elements in the frame (items that don't scroll)
function splitFixed(childNodes) {
	let splitNodeData = [];
	let fixedIndex = childNodes[0].parent.numberOfFixedChildren;
	let fixedNodes:[] = childNodes.slice(childNodes.length - fixedIndex);
	let scrollingNodes:[] = childNodes.slice(0, childNodes.length - fixedIndex);
	splitNodeData.push(fixedNodes,scrollingNodes);
	return splitNodeData;
}

export default { organizeNodesByParent, findDistanceFromTop, removeDuplicates, naturalCompare, splitFixed};