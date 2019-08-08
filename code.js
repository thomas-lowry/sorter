figma.showUI(__html__, { width: 240, height: 176 });
//
// Ordering functions
//
//sort the stack order by top to bottom, left to right
function sortPosition(nodeData) {
    nodeData.sort(function (node1, node2) {
        if (node1.y < node2.y)
            return 1;
        if (node1.y > node2.y)
            return -1;
        if (node1.x < node2.x)
            return 1;
        if (node1.x > node2.x)
            return -1;
    });
    return nodeData;
}
//sort the stack order alphabetically, ascending or descending
function sortAlpha(nodeData, direction) {
    nodeData.sort(function (node1, node2) {
        if (node1.name < node2.name)
            return 1;
        if (node1.name > node2.name)
            return -1;
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
    var reversedData = nodeData.slice().reverse();
    return reversedData;
}
//randomize the stack order
function sortRandom(nodeData) {
    var _a;
    for (var i = nodeData.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [nodeData[j], nodeData[i]], nodeData[i] = _a[0], nodeData[j] = _a[1];
    }
    return nodeData;
}
//
// Helper functions
//
//organize nodes into arrays based on common parent
function organizeNodesByParent(nodes) {
    var groupedNodes = nodes.reduce(function (acc, item) {
        if (!acc[item.parent.id]) {
            acc[item.parent.id] = [];
        }
        acc[item.parent.id].push(item);
        return acc;
    }, {});
    console.log(groupedNodes);
    return groupedNodes;
}
figma.ui.onmessage = function (msg) {
    var selection = Array.from(figma.currentPage.selection);
    var sortOrder = msg.order;
    if (selection.length <= 1) {
        alert('Please select at least 2 layers');
    }
    var organizedNodes = organizeNodesByParent(selection);
    Object.keys(organizedNodes).forEach(function (group) {
        var item = group.toString();
        var groupedNodes = organizedNodes[item];
        var orderedNodes = [];
        var parent = organizedNodes[item][0].parent;
        if (sortOrder == 'sortPosition') {
            orderedNodes = sortPosition(groupedNodes);
        }
        else if (sortOrder == 'sortAlphaAsc') {
            orderedNodes = sortAlpha(groupedNodes, 'asc');
        }
        else if (sortOrder == 'sortAlphaDesc') {
            orderedNodes = sortAlpha(groupedNodes, 'desc');
        }
        else if (sortOrder == 'sortReverse') {
            orderedNodes = sortReverse(groupedNodes);
        }
        else {
            orderedNodes = sortRandom(groupedNodes);
        }
        orderedNodes.forEach(function (node) {
            parent.appendChild(node);
        });
    });
};
