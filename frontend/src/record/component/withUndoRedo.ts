import {ReactEditor} from "slate-react";

type UndoRedoEditor = {
    undo: () => void,
    redo: () => void
};

export default function withUndoRedo<T extends ReactEditor>(editor: T, undo: () => void, redo: () => void): T & UndoRedoEditor {
    let undoRedoEditor = editor as T & UndoRedoEditor;
    undoRedoEditor.undo = undo;
    undoRedoEditor.redo = redo;
    return undoRedoEditor;
}
