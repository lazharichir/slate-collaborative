import React, { KeyboardEvent, useCallback, useMemo, useContext, useEffect, useState } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, RenderElementProps, RenderLeafProps, Slate, useSlate, withReact } from 'slate-react'
import { createEditor, Editor, Transforms } from 'slate'

import { useCursorsDecorator, useSlateResource, withUndoRedo } from "@wleroux/slate-react-resource";
import { SlateOperation } from "@wleroux/slate-value";
import Caret from "./Caret";
import Button from "./Button";
import Icon from "./Icon";
import Toolbar from "./Toolbar";
import { ClientId, ResourceId } from "@wleroux/resource";

const HOTKEYS: { [key: string]: Format } = {
	'mod+b': 'bold',
	'mod+i': 'italic',
	'mod+u': 'underline',
	'mod+`': 'code',
}

type Format =
	| "bold"
	| "italic"
	| "underline"
	| "code"
	| "heading-one"
	| "heading-two"
	| "block-quote"
	| "numbered-list"
	| "bulleted-list"
	;

const LIST_TYPES = ['numbered-list', 'bulleted-list']

type RichTextEditorProps = {
	clientId: ClientId,
	resourceId: ResourceId
}

export default function CollaborativeRichTextEditor(props: RichTextEditorProps) {
	let { value, selection, cursors, version, apply, undo, redo } = useSlateResource(props.resourceId, props.clientId);
	const cursorsDecoration = useCursorsDecorator(cursors);
	const editor = useMemo(() => withUndoRedo(withReact(createEditor()), undo, redo), [undo, redo])
	let changeHandler = useCallback(() => apply(editor.operations as SlateOperation[]), [editor, apply]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	let renderLeaf = useCallback((props) => Leaf(props), [cursorsDecoration]);
	return (
		<Slate key={props.resourceId + props.clientId} editor={editor} selection={selection} value={value.children} onChange={changeHandler}>
			Version: {version}
			<Toolbar>
				<MarkButton format="bold" icon="format_bold" />
				<MarkButton format="italic" icon="format_italic" />
				<MarkButton format="underline" icon="format_underlined" />
				<MarkButton format="code" icon="code" />
				<BlockButton format="heading-one" icon="looks_one" />
				<BlockButton format="heading-two" icon="looks_two" />
				<BlockButton format="block-quote" icon="format_quote" />
				<BlockButton format="numbered-list" icon="format_list_numbered" />
				<BlockButton format="bulleted-list" icon="format_list_bulleted" />
			</Toolbar>
			<Editable
				renderElement={renderElement}
				renderLeaf={renderLeaf}
				placeholder="Enter some rich text…"
				spellCheck="false"
				decorate={cursorsDecoration}
				autoFocus
				onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
					for (const hotkey in HOTKEYS) {
						//@ts-ignore
						if (isHotkey(hotkey, event)) {
							event.preventDefault()
							const mark = HOTKEYS[hotkey]
							toggleMark(editor, mark)
						}
					}
				}} />
		</Slate>);
}

function toggleBlock(editor: Editor, format: Format) {
	const isActive = isBlockActive(editor, format)
	const isList = LIST_TYPES.includes(format)

	Transforms.unwrapNodes(editor, {
		match: n => LIST_TYPES.includes(n.type as unknown as any),
		split: true,
	})

	Transforms.setNodes(editor, {
		type: isActive ? 'paragraph' : isList ? 'list-item' : format,
	})

	if (!isActive && isList) {
		const block = { type: format, children: [] }
		Transforms.wrapNodes(editor, block)
	}
}

const toggleMark = (editor: Editor, format: Format) => {
	const isActive = isMarkActive(editor, format)

	if (isActive) {
		Editor.removeMark(editor, format)
	} else {
		Editor.addMark(editor, format, true)
	}
}

function isBlockActive(editor: Editor, format: Format) {
	const match = Editor.nodes(editor, {
		match: n => n.type === format,
	})[Symbol.iterator]().next().value;

	return !!match
}

const isMarkActive = (editor: Editor, format: Format) => {
	const marks = Editor.marks(editor)
	return marks ? marks[format] === true : false
}

function renderElement({ attributes, children, element }: RenderElementProps) {
	switch (element.type) {
		case 'block-quote': return (<blockquote {...attributes}>{children}</blockquote>);
		case 'bulleted-list': return (<ul {...attributes}>{children}</ul>);
		case 'heading-one': return (<h1 {...attributes}>{children}</h1>);
		case 'heading-two': return (<h2 {...attributes}>{children}</h2>);
		case 'list-item': return (<li {...attributes}>{children}</li>);
		case 'numbered-list': return (<ol {...attributes}>{children}</ol>);
		default: return (<p {...attributes}>{children}</p>)
	}
}

function Leaf({ attributes, children, leaf }: RenderLeafProps) {
	if (leaf.bold) children = <strong>{children}</strong>
	if (leaf.code) children = <code>{children}</code>
	if (leaf.italic) children = <em>{children}</em>
	if (leaf.underline) children = <u>{children}</u>

	return (<span {...attributes}
		style={{ position: 'relative', backgroundColor: leaf.cursor ? "rgba(255, 255, 0, 0.5)" : undefined } as any}>
		{leaf.isBackwardCaret ? <Caret color={"#FF0"} /> : null}
		{children}
		{leaf.isForwardCaret ? <Caret color={"#FF0"} /> : null}
	</span>);
}

type BlockButtonProps = {
	format: Format,
	icon: string
}
function BlockButton({ format, icon }: BlockButtonProps) {
	const editor = useSlate()
	return (
		<Button
			active={isBlockActive(editor, format)}
			onMouseDown={event => {
				event.preventDefault()
				toggleBlock(editor, format)
			}}>
			<Icon>{icon}</Icon>
		</Button>);
}

type MarkButtonProps = {
	format: Format,
	icon: string
};
function MarkButton({ format, icon }: MarkButtonProps) {
	const editor = useSlate()
	return (
		<Button
			active={isMarkActive(editor, format)}
			onMouseDown={event => {
				event.preventDefault()
				toggleMark(editor, format)
			}}>
			<Icon>{icon}</Icon>
		</Button>);
}
