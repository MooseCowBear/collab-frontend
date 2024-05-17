import { useRef, useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";

import "../styles/editor.css";
import { getDocument, peerExtension } from "../collab_utils/utils";
import { Connection } from "../collab_utils/connection";

export const CollabEditor = () => {
  const editor = useRef();
  const [editorInfo, setEditorInfo] = useState(null);

  // loading state, etc?
  useEffect(() => {
    // const collabDocumentState = async () => {
    //   const { version, doc } = await getDocument(new Connection(worker));
    //   return { version, doc };
    // };

    async function createPeer() {
      const worker = new Worker("../collab_utils/worker.js");
      const connection = new Connection(worker);
      let { version, doc } = await getDocument(connection);
      let state = EditorState.create({
        doc,
        extensions: [basicSetup, peerExtension(version, connection)],
      });
      setEditorInfo(state);
      //new EditorView({ state: state, parent: editor.current });
    }

    // const { version, doc } = collabDocumentState();
    // console.log("in use effect, version, doc", version, doc);

    // const collabStartState = EditorState.create({
    //   doc,
    //   extensions: [basicSetup, peerExtension(version, connection)],
    // });

    // const view = new EditorView({
    //   state: collabStartState,
    //   parent: editor.current,
    // });

    let view = null;

    if (!editorInfo) {
      createPeer();
    } else {
      console.log("creating the editor...");
      view = new EditorView({state: editorInfo, parent: editor.current});
    }

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [editorInfo]);

  console.log("rendering editor");
  return <div className="collab-editor" ref={editor}></div>;
};
