'use strict';

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
                let index = children.findIndex(x => x.id === node.id);
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
    let topMostIndex = indexes[indexes.length - 1];
    let numOfLayersFromTop = (children.length - 1) - topMostIndex;
    return numOfLayersFromTop;
}
// This function will remove the duplicate nodes between the selection and the matches
// that exist in the parent node
// we need to do this because the selection data from Figma doesnot guarantee 
// that they will be in the same order as they arewithin the array of children
function removeDuplicates(nodes, children) {
    let newChildren = children.filter(function (c) {
        return !nodes.find(function (n) {
            return n.id == c.id;
        });
    });
    return newChildren;
}
// function to handle natural sorting when sorting alphabetical
function naturalCompare(b, a) {
    var ax = [], bx = [];
    a.name.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]); });
    b.name.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]); });
    while (ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if (nn)
            return nn;
    }
    return ax.length - bx.length;
}
//split array if there are fixed elements in the frame (items that don't scroll)
function splitFixed(childNodes) {
    let splitNodeData = [];
    let fixedIndex = childNodes[0].parent.numberOfFixedChildren;
    let fixedNodes = childNodes.slice(childNodes.length - fixedIndex);
    let scrollingNodes = childNodes.slice(0, childNodes.length - fixedIndex);
    splitNodeData.push(fixedNodes, scrollingNodes);
    return splitNodeData;
}
var helpers = { organizeNodesByParent, findDistanceFromTop, removeDuplicates, naturalCompare, splitFixed };
//# sourceMappingURL=helpers.js.map

function alphabetical(nodeData, direction) {
    nodeData.sort(helpers.naturalCompare);
    switch (direction) {
        case "asc":
            return nodeData;
        case "dsc":
            nodeData = nodeData.reverse();
            return nodeData;
    }
}
// POSITION
//sorts nodes based on x,y position
function position(nodeData) {
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
    children = children.filter(function (entry1) {
        return nodeData.some(function (entry2) { return entry1.id === entry2.id; });
    });
    children.reverse();
    return children;
}
function reverseChildren(nodeData) {
    nodeData = nodeData.reverse();
    return nodeData;
}
var sort = { alphabetical, position, random, reverse, reverseChildren };
//# sourceMappingURL=sort.js.map

//imports
var count = 0;
//commands
if (figma.command === 'sorter') {
    //get plugin data to remember last settings for subsequent plugin runs
    var sortChildrenSetting = figma.root.getPluginData('sortChildrenOnly');
    //show UI
    figma.showUI(__html__, { width: 240, height: 228 });
    //send a msg to the UI to remember state of sort children toggle
    if (sortChildrenSetting) {
        figma.ui.postMessage({
            'sortChildrenOnly': sortChildrenSetting
        });
    }
}
else {
    //menu commands
    if (figma.command === 'position') {
        sortLayers('sortPosition', false);
    }
    else if (figma.command === 'positionChildren') {
        sortLayers('sortPosition', true);
    }
    else if (figma.command === 'alphaAsc') {
        sortLayers('sortAlphaAsc', false);
    }
    else if (figma.command === 'alphaAscChildren') {
        sortLayers('sortAlphaAsc', true);
    }
    else if (figma.command === 'alphaDsc') {
        sortLayers('sortAlphaDsc', false);
    }
    else if (figma.command === 'alphaDscChildren') {
        sortLayers('sortAlphaDsc', true);
    }
    else if (figma.command === 'reverse') {
        sortLayers('sortReverse', false);
    }
    else if (figma.command === 'reverseChildren') {
        sortLayers('sortReverse', true);
    }
    else if (figma.command === 'random') {
        sortLayers('sortRandom', false);
    }
    else if (figma.command === 'randomChildren') {
        sortLayers('sortRandom', true);
    }
    //show a msg when the plugin closes
    figma.closePlugin(count + ' layers sorted.');
}
//sorting function
function sortLayers(order, children) {
    let selection = Array.from(figma.currentPage.selection);
    if (children === true) {
        selection.forEach(parentNode => {
            let parent = parentNode;
            let childNodes = parent.children;
            if (childNodes != undefined) {
                //new array to store the newly ordered nodes
                let orderedNodes = [];
                let fixedChildren = parent.numberOfFixedChildren;
                let fixed = false;
                //use these arrays if there are fixed elements
                let splitNodes = [];
                let fixedNodes = [];
                let scrollingNodes = [];
                //turn child nodes into array  
                childNodes = Array.from(childNodes);
                //do not sort if there is less than 1 child
                if (childNodes.length <= 1) {
                    figma.notify('Parent must contain at least 2 children');
                    return;
                }
                //determine if there are any fixed children
                if (fixedChildren > 0) {
                    fixed = true;
                    splitNodes = helpers.splitFixed(childNodes);
                }
                if (order == 'sortPosition') {
                    if (fixed) {
                        fixedNodes = sort.position(splitNodes[0]);
                        scrollingNodes = sort.position(splitNodes[1]);
                    }
                    else {
                        orderedNodes = sort.position(childNodes);
                    }
                }
                else if (order == 'sortAlphaAsc') {
                    if (fixed) {
                        fixedNodes = sort.alphabetical(splitNodes[0], 'asc');
                        scrollingNodes = sort.alphabetical(splitNodes[1], 'asc');
                    }
                    else {
                        orderedNodes = sort.alphabetical(childNodes, 'asc');
                    }
                }
                else if (order == 'sortAlphaDsc') {
                    if (fixed) {
                        fixedNodes = sort.alphabetical(splitNodes[0], 'dsc');
                        scrollingNodes = sort.alphabetical(splitNodes[1], 'dsc');
                    }
                    else {
                        orderedNodes = sort.alphabetical(childNodes, 'dsc');
                    }
                }
                else if (order == 'sortReverse') {
                    if (fixed) {
                        fixedNodes = sort.reverseChildren(splitNodes[0]);
                        scrollingNodes = sort.reverseChildren(splitNodes[1]);
                    }
                    else {
                        orderedNodes = sort.reverseChildren(childNodes);
                    }
                }
                else {
                    if (fixed) {
                        fixedNodes = sort.random(splitNodes[0]);
                        scrollingNodes = sort.random(splitNodes[1]);
                    }
                    else {
                        orderedNodes = sort.random(childNodes);
                    }
                }
                if (fixed) {
                    let totalChildren = childNodes.length;
                    let fixedIndex = parent.numberOfFixedChildren;
                    for (let i = 0; i < totalChildren - fixedIndex; i++) {
                        parent.insertChild(i, scrollingNodes[i]);
                        count++;
                    }
                    for (let i = 0; i < fixedNodes.length; i++) {
                        parent.appendChild(fixedNodes[i]);
                        count++;
                    }
                }
                else {
                    orderedNodes.forEach(node => {
                        parent.appendChild(node);
                        count++;
                    });
                }
            }
        });
    }
    else {
        if (selection.length <= 1) {
            figma.notify('Please select at least 2 layers');
            return;
        }
        let organizedNodes = helpers.organizeNodesByParent(selection);
        Object.entries(organizedNodes).forEach(entries => {
            entries.forEach(entry => {
                if (Array.isArray(entry)) {
                    let orderedNodes = [];
                    let parent = entry[0].parent;
                    let children = parent.children;
                    let distanceFromTop = helpers.findDistanceFromTop(entry, children);
                    let childrenWithNoDuplicates = helpers.removeDuplicates(entry, children);
                    if (order == 'sortPosition') {
                        orderedNodes = sort.position(entry);
                    }
                    else if (order == 'sortAlphaAsc') {
                        orderedNodes = sort.alphabetical(entry, 'asc');
                    }
                    else if (order == 'sortAlphaDsc') {
                        orderedNodes = sort.alphabetical(entry, 'dsc');
                    }
                    else if (order == 'sortReverse') {
                        orderedNodes = sort.reverse(entry);
                    }
                    else {
                        orderedNodes = sort.random(entry);
                    }
                    let newChildArr = [];
                    let indexToSpliceAt = childrenWithNoDuplicates.length - distanceFromTop;
                    let topNodes = childrenWithNoDuplicates.splice(indexToSpliceAt);
                    childrenWithNoDuplicates.forEach(node => {
                        newChildArr.push(node);
                    });
                    orderedNodes.forEach(node => {
                        newChildArr.push(node);
                    });
                    topNodes.forEach(node => {
                        newChildArr.push(node);
                    });
                    newChildArr.forEach(child => {
                        parent.appendChild(child);
                        count++;
                    });
                }
            });
        });
    }
}
//plugin functions
figma.ui.onmessage = msg => {
    //get values from UI
    let sortOrder = msg.order;
    let children = msg.children;
    //set plugin data
    figma.root.setPluginData('sortChildrenOnly', children.toString());
    //sort layers
    sortLayers(sortOrder, children);
    //figma notify
    figma.notify(count + ' layers sorted.', { timeout: 800 });
    count = 0;
};
