![Sorter promo image](img/banner.png?raw=true "Sort promo")

# Sorter
A small utility plugin to help you sort/re-order layers in Figma

## How to use
Sorter by default will take your selection and sort them using the ordering of your choice, relative to each items parent. This means you can have a mixed selection of top level frames, and child elements and the plugin will always sort them without throwing errors.

If you only want to sort children of your selection, enable the "Sort Children Only" option. Sorter will remember your selection for the next time you run the plugin in that file.

## Sorting methods

### Position
This will sort your selection using top, left → bottom, right ordering. In other words, your top left most element on the canvas will be at the top of the layer stack and your bottom right most element at the very bottom.

### Alphabetical
You can sort alphabetical based on layer names. Ascending will sort layers 0 → 9, A → Z. Descending will sort layers Z → A, 9 → 0.

### Reverse
This will reverse the order of your current layer selection

### Random
This will randomize your selection of layers. Though seldomly useful, this can be a useful option for explortion randomzied stacking order in generative or illustrative visuals.
