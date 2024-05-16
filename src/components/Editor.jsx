import { defaultKeymap } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { useRef, useEffect } from "react";

import "../styles/editor.css";

export const Editor = () => {
  const editor = useRef();

  useEffect(() => {
    const startState = EditorState.create({
      doc: "Hello world",
      extensions: [basicSetup, keymap.of(defaultKeymap)],
    });

    const view = new EditorView({ state: startState, parent: editor.current });

    return () => {
      view.destroy();
    };
  }, []);

  return <div className="editor" ref={editor}></div>;
};
