import { useRef, useEffect } from "react";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { cursorTooltip } from "../non_collab_utils/tooltip";

import "../styles/editor.css";

export const Editor = () => {
  const editor = useRef();

  useEffect(() => {
    const startState = EditorState.create({
      doc: "Hello world",
      extensions: [
        basicSetup,
        keymap.of([defaultKeymap, indentWithTab]),
        python(),
        cursorTooltip(),
      ],
    });

    const view = new EditorView({ state: startState, parent: editor.current });

    return () => {
      view.destroy();
    };
  }, []);

  return <div className="editor" ref={editor}></div>;
};

// simple, non-collab editor
