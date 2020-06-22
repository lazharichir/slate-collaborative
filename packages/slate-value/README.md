# Collaborative Value Type for Slate

This package contains the necessary code structures to support collaborative editing of [Slate](https://www.slatejs.org/).

# Model

## Slate Value

The slate value is a list of either an Element node or a Text node.

* Element
* Text

## Slate Selection

The Slate Selection includes an anchor and a focus that indicate the path and offset of the cursor.

## Slate Operators

Slate provides 9 operations to modify the Slate Value:

* insert_text
* remove_text
* set_selection
* insert_node
* remove_node
* move_node
* set_node
* split_node
* merge_node
