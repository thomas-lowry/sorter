figma.showUI(__html__, { width: 240, height: 224 });
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
    var parentNode = nodeData[0].parent;
    var children = parentNode.children;
    children = children.filter(function (entry1) {
        return nodeData.some(function (entry2) { return entry1.id === entry2.id; });
    });
    children.reverse();
    return children;
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
function organizeNodesByParent(nodes) {
    var groupedNodes = nodes.reduce(function (r, a) {
        r[a.parent.id] = (r[a.parent.id] || []).concat([a]);
        return r;
    }, {});
    return groupedNodes;
}
figma.ui.onmessage = function (msg) {
    var selection = Array.from(figma.currentPage.selection);
    var sortOrder = msg.order;
    if (selection.length <= 1) {
        alert('Please select at least 2 layers');
    }
    var organizedNodes = organizeNodesByParent(selection);
    Object.entries(organizedNodes).forEach(function (entries) {
        entries.forEach(function (entry) {
            if (Array.isArray(entry)) {
                var orderedNodes = [];
                var parent_1 = entry[0].parent;
                if (sortOrder == 'sortPosition') {
                    orderedNodes = sortPosition(entry);
                }
                else if (sortOrder == 'sortAlphaAsc') {
                    orderedNodes = sortAlpha(entry, 'asc');
                }
                else if (sortOrder == 'sortAlphaDesc') {
                    orderedNodes = sortAlpha(entry, 'desc');
                }
                else if (sortOrder == 'sortReverse') {
                    orderedNodes = sortReverse(entry);
                }
                else {
                    orderedNodes = sortRandom(entry);
                }
                orderedNodes.forEach(function (node) {
                    parent_1.appendChild(node);
                });
            }
        });
    });
};
