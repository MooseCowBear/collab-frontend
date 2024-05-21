import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { indentUnit } from "@codemirror/language";
import { useEffect, useState, useRef } from "react";
import { peerExtension, getDocument } from "../socket_utils/utils";
import "../styles/editor.css";

//import { cursorTooltip } from "../non_collab_utils/tooltip"; // only shows one cursor, which makes sense.
import { cursorExtension } from "../socket_utils/cursor";

const randomName = () => {
  const num = Math.floor(Math.random() * 1000);
  return `user_${num}`;
};

export const SocketEditor = (socket) => {
  const [doc, setDoc] = useState(null);
  const [version, setVersion] = useState(null);
  const [connected, setConnected] = useState(false);
  const nameRef = useRef(randomName());

  const docName = "default";

  useEffect(() => {
    async function setupEditor() {
      let { version, doc } = await getDocument(socket, docName);
      setVersion(version);
      setDoc(doc.toString());
      setConnected(true);

      socket.socket.on("connect", () => {
        setConnected(true);
      });
      socket.socket.on("disconnect", () => {
        setConnected(false);
      });
    }

    setupEditor();
    return () => {
      console.log("disconnecting component");
      socket.socket.off("connect");
      socket.socket.off("disconnect");
      socket.socket.off("display");
      socket.socket.off("pullUpdateResponse");
      socket.socket.off("pushUpdateResponse");
      socket.socket.off("getDocumentResponse");
    };
  }, [socket, docName]);

  if (!doc || version === null) return <p>loading...</p>;

  return (
    <>
      <h1>{`${docName}: version ${version}`}</h1>
      <CodeMirror
        className=""
        height="100%"
        basicSetup={false}
        id="codeEditor"
        extensions={[
          indentUnit.of("\t"),
          basicSetup(),
          langs.python(),
          peerExtension(socket, docName, version),
          cursorExtension(nameRef.current),
        ]}
        value={doc}
      />
    </>
  );
};

// version is never reset in state so you can't see it unless refresh

// note: auto complete does not work. throws Unhandled Promise Rejection: TypeError: JSON.stringify cannot serialize cyclic structures.
