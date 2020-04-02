//imports
import sort from './scripts/sort';
import helpers from './scripts/helpers';

var count:number = 0;

//commands
if (figma.command === 'sorter') {

    //get plugin data to remember last settings for subsequent plugin runs
    var sortChildrenSetting = figma.root.getPluginData('sortChildrenOnly');

    //show UI
    figma.showUI(__html__, {width: 200, height: 246 });

    //send a msg to the UI to remember state of sort children toggle
    if (sortChildrenSetting) {
        figma.ui.postMessage({
            'sortChildrenOnly': sortChildrenSetting
        });
    }
	
} else {

    //menu commands
    if (figma.command === 'positionHorzVert') {
        sortLayers('sortPositionHorzVert', false);
    } else if (figma.command === 'positionHorzVertChildren') {
        sortLayers('sortPositionHorzVert', true);
    } else if (figma.command === 'positionVertHorz') {
        sortLayers('sortPositionVertHorz', false);
    } else if (figma.command === 'positionVertHorzChildren') {
        sortLayers('sortPositionVertHorz', true);
    } else if (figma.command === 'alphaAsc') {
        sortLayers('sortAlphaAsc', false);
    } else if (figma.command === 'alphaAscChildren') {
        sortLayers('sortAlphaAsc', true);
    } else if (figma.command === 'alphaDsc') {
        sortLayers('sortAlphaDsc', false);
    } else if (figma.command === 'alphaDscChildren') {
        sortLayers('sortAlphaDsc', true);
    } else if (figma.command === 'reverse') {
        sortLayers('sortReverse', false);
    } else if (figma.command === 'reverseChildren') {
        sortLayers('sortReverse', true);
    } else if (figma.command === 'random') {
        sortLayers('sortRandom', false);
    } else if (figma.command === 'randomChildren') {
        sortLayers('sortRandom', true);
    }

    //show a msg when the plugin closes
    figma.closePlugin(count + ' layers sorted.');
}

//sorting function
function sortLayers(order, children) {

    let selection:SceneNode[] = Array.from(figma.currentPage.selection);

    if (children === true) {
		selection.forEach(parentNode => {
			let parent = parentNode as FrameNode|ComponentNode;
            let childNodes = parent.children;

			if (childNodes != undefined) {

                //new array to store the newly ordered nodes
                let orderedNodes = [];
                let fixedChildren:number = parent.numberOfFixedChildren;
                let fixed:boolean = false;
                
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

                if (order == 'sortPositionHorzVert') {
                    if (fixed) {
                        fixedNodes = sort.positionHorzVert(splitNodes[0]);
                        scrollingNodes = sort.positionHorzVert(splitNodes[1]);
                    } else {
                        orderedNodes = sort.positionHorzVert(childNodes);
                    }
                } else if (order == 'sortPositionVertHorz') {
                    if (fixed) {
                        fixedNodes = sort.positionVertHorz(splitNodes[0]);
                        scrollingNodes = sort.positionVertHorz(splitNodes[1]);
                    } else {
                        orderedNodes = sort.positionVertHorz(childNodes);
                    }
                } else if (order == 'sortAlphaAsc') {
                    if (fixed) {
                        fixedNodes = sort.alphabetical(splitNodes[0],'asc');
                        scrollingNodes = sort.alphabetical(splitNodes[1],'asc');
                    } else {
                        orderedNodes = sort.alphabetical(childNodes, 'asc');
                    }
                } else if (order == 'sortAlphaDsc') {
                    if (fixed) {
                        fixedNodes = sort.alphabetical(splitNodes[0],'dsc');
                        scrollingNodes = sort.alphabetical(splitNodes[1],'dsc');
                    } else {
                        orderedNodes = sort.alphabetical(childNodes, 'dsc');
                    }                    
                } else if (order == 'sortReverse') {
                    if (fixed) {
                        fixedNodes = sort.reverseChildren(splitNodes[0]);
                        scrollingNodes = sort.reverseChildren(splitNodes[1]);
                    } else {
                        orderedNodes = sort.reverseChildren(childNodes);
                    }
                } else { 
                    if (fixed) {
                        fixedNodes = sort.random(splitNodes[0]);
                        scrollingNodes = sort.random(splitNodes[1]);
                    } else {
                        orderedNodes = sort.random(childNodes);
                    }
                }

                if (fixed) {

                    let totalChildren:number = childNodes.length;
                    let fixedIndex:number = parent.numberOfFixedChildren;

                    for (let i = 0; i < totalChildren - fixedIndex; i++) {
                        parent.insertChild(i, scrollingNodes[i]);
                        count++;
                    }

                    for (let i = 0; i < fixedNodes.length; i++) {
                        parent.appendChild(fixedNodes[i]);
                        count++;
                    }

                } else {
                    orderedNodes.forEach(node => {
                        parent.appendChild(node);
                        count++;
                    });
                }
			}
		});

	} else {

		if (selection.length <= 1) {
			figma.notify('Please select at least 2 layers');
			return;
		}
	
		let organizedNodes = helpers.organizeNodesByParent(selection);
	
		Object.entries(organizedNodes).forEach(entries => {
	
			entries.forEach(entry => {
				if (Array.isArray(entry)) {
	
					let orderedNodes = [];
					let parent = entry[0].parent
					let children = parent.children;
					let distanceFromTop = helpers.findDistanceFromTop(entry, children);
					let childrenWithNoDuplicates = helpers.removeDuplicates(entry, children);
	
					if (order == 'sortPositionHorzVert') {
                        orderedNodes = sort.positionHorzVert(entry);
                    } else if (order == 'sortPositionVertHorz') {
                        orderedNodes = sort.positionVertHorz(entry);
					} else if (order == 'sortAlphaAsc') {
						orderedNodes = sort.alphabetical(entry, 'asc');
					} else if (order == 'sortAlphaDsc') {
						orderedNodes = sort.alphabetical(entry, 'dsc');
					} else if (order == 'sortReverse') {
						orderedNodes = sort.reverse(entry);
					} else { 
						orderedNodes = sort.random(entry);
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
                        count++;
					})
				}
			})
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
    figma.notify(count + ' layers sorted.', {timeout: 800})
    count = 0;
    
};
