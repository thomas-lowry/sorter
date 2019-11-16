figma.showUI(__html__, { width: 240, height: 290 });
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
//sort the stack order by x-axis from left to right
function sortPositionX(nodeData) {
    nodeData.sort(function (node1, node2) {
        if (node1.x < node2.x)
            return 1;
        else
            return -1;
    });
    return nodeData;
}

//sort the stack order by y-axis from top to bottom
function sortPositionY(nodeData) {
    nodeData.sort(function (node1, node2) {
        if (node1.y < node2.y)
            return 1;
        else
            return -1;
    });
    return nodeData;
}

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
function sortChildrenReverse(nodeData) {
    nodeData = nodeData.reverse();
    return nodeData;
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
// This function takes the selection, and builds a new array of arrays that are grouped by nodes that share the same parent
// This allows us to sort those layers in context of their parent, and then re-insert them into the parent node
// This function is then used buy the sorting functions to sort each group individually by the sort order chosen by the user
function organizeNodesByParent(nodes) {
    var groupedNodes = nodes.reduce(function (r, a) {
        r[a.parent.id] = (r[a.parent.id] || []).concat([a]);
        return r;
    }, {});
    return groupedNodes;
}
// This function returns the number of layers from top of layer stack
// We need this to figure out the index in which we will reinsert the sorted children back into the layer stack
function findDistanceFromTop(nodes, children) {
    var indexes = [];
    var newChildren = [];
    //build array of index of matches elements
    children.forEach(function (child) {
        nodes.forEach(function (node) {
            if (child.id === node.id) {
                var index = children.findIndex(function (x) { return x.id === node.id; });
                indexes.push(index);
            }
        });
    });
    //sort array of indexes to find the larest
    indexes.sort(function (node1, node2) {
        if (node1 > node2)
            return 1;
        if (node1 < node2)
            return -1;
    });
    var topMostIndex = indexes[indexes.length - 1];
    var numOfLayersFromTop = (children.length - 1) - topMostIndex;
    return numOfLayersFromTop;
}
// This function will remove the duplicate nodes between the selection and the matches
// that exist in the parent node
// we need to do this because the selection data from Figma doesnot guarantee 
// that they will be in the same order as they arewithin the array of children
function removeDuplicates(nodes, children) {
    var newChildren = children.filter(function (c) {
        return !nodes.find(function (n) {
            return n.id == c.id;
        });
    });
    return newChildren;
}

function sortCases(sortOrder, orderedNodes, node) {
    switch (sortOrder) {
        case 'sortPositionX':
            orderedNodes = sortPositionX(node);
            return orderedNodes;
        case 'sortPositionY':
            orderedNodes = sortPositionY(node);
            return orderedNodes;
        case 'sortPosition':
            orderedNodes = sortPosition(node);
            return orderedNodes;
        case 'sortAlphaAsc':
            orderedNodes = sortAlpha(node, 'asc');
            return orderedNodes;
        case 'sortAlphaDesc':
            orderedNodes = sortAlpha(node, 'desc');
            return orderedNodes;
        case 'sortReverse':
            orderedNodes = sortReverse(node);
            return orderedNodes;
        case 'sortRandom':
            orderedNodes = sortRandom(node);
            return orderedNodes;
        default:
            figma.notify('Ah Sh*t, Here We Go Again', { timeout: 200 });
        
    }
}

function sortChildrenFunction(sortOrder) {
    var selection = Array.from(figma.currentPage.selection);

    selection.forEach(function (parentNode) {
        var parent = parentNode;
        var childNodes = parent.children;
        if (childNodes != undefined) {
            if (childNodes.length <= 1) {
                figma.notify('Parent must contain at least 2 children');
                return;
            }
            var orderedNodes = [];
            childNodes = Array.from(childNodes);

            orderedNodes = sortCases(sortOrder, orderedNodes, childNodes);

            orderedNodes.forEach(function (node) {
                parent.appendChild(node);
            });
        }
    });
}

function sortSelectedFunction(sortOrder) {
    var selection = Array.from(figma.currentPage.selection);

    if (selection.length <= 1) {
        figma.notify('Please select at least 2 layers');
        return;
    }
    var organizedNodes = organizeNodesByParent(selection);
    Object.entries(organizedNodes).forEach(function (entries) {
        entries.forEach(function (entry) {
            if (Array.isArray(entry)) {
                var orderedNodes = [];
                var parent_1 = entry[0].parent;
                var children_1 = parent_1.children;
                var distanceFromTop = findDistanceFromTop(entry, children_1);
                var childrenWithNoDuplicates = removeDuplicates(entry, children_1);

                orderedNodes = sortCases(sortOrder, orderedNodes, entry);

                var newChildArr_1 = [];
                var indexToSpliceAt = childrenWithNoDuplicates.length - distanceFromTop;
                var topNodes = childrenWithNoDuplicates.splice(indexToSpliceAt);
                childrenWithNoDuplicates.forEach(function (node) {
                    newChildArr_1.push(node);
                });
                orderedNodes.forEach(function (node) {
                    newChildArr_1.push(node);
                });
                topNodes.forEach(function (node) {
                    newChildArr_1.push(node);
                });
                newChildArr_1.forEach(function (child) {
                    parent_1.appendChild(child);
                });
            }
        });
    });
    figma.notify(sortOrder + " " + "finished 🎉", { timeout: 200 });
}

if (figma.command == "sortUI") {
    figma.ui.onmessage = function (msg) {
        //get values from UI
        var sortOrder = msg.order;
        var children = msg.children;
        //set plugin data
        figma.root.setPluginData('sortChildrenOnly', children.toString());
        if (children === true) {
            sortChildrenFunction(sortOrder);
        }
        else {
            sortSelectedFunction(sortOrder);
        }
    };
}
else {
    figma.ui.hide();
    if (figma.command == "sortPositionX") {
        sortSelectedFunction("sortPositionX");
        figma.closePlugin();
    }
    else if (figma.command == "sortPositionY") {
        sortSelectedFunction("sortPositionY");
        figma.closePlugin();
    }
    else if (figma.command == "sortPosition") {
        sortSelectedFunction("sortPosition");
        figma.closePlugin();
    }
    else if (figma.command == "sortAlphaAsc") {
        sortSelectedFunction("sortAlphaAsc");
        figma.closePlugin();
    }
    else if (figma.command == "sortAlphaDesc") {
        sortSelectedFunction("sortAlphaDesc");
        figma.closePlugin();
    }
    else if (figma.command == "sortReverse") {
        sortSelectedFunction("sortReverse");
        figma.closePlugin();
    }
    else if (figma.command == "sortRandom") {
        sortSelectedFunction("sortRandom");
        figma.closePlugin();
    }
}
