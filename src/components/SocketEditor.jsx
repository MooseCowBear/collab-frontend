import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { indentUnit } from "@codemirror/language";
import { peerExtension, getDocument } from "../socket_utils/utils";
import "../styles/editor.css";

import { cursorExtension } from "../socket_utils/cursor";

const randomName = () => {
  const num = Math.floor(Math.random() * 1000);
  return `user_${num}`;
};

export const SocketEditor = ({ socket, documentName }) => {
  const [doc, setDoc] = useState(null);
  const [version, setVersion] = useState(null);
  const [connected, setConnected] = useState(false);
  const nameRef = useRef(randomName());

  useEffect(() => {
    async function setupEditor() {
      let { version, doc } = await getDocument(socket, documentName);
      console.log(version, doc);
      setVersion(version);
      setDoc(doc.toString());
      setConnected(true);

      socket.on("connect", () => {
        setConnected(true);
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });
    }

    setupEditor();
    return () => {
      console.log("disconnecting component");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("save");
      socket.off("pullUpdateResponse");
      socket.off("pushUpdateResponse");
      socket.off("getDocumentResponse");
    };
  }, [socket, documentName]);

  console.log(documentName);

  if (!doc || version === null) return <p>loading...</p>;

  return (
    <>
      <h1>{`${documentName}: version ${version}, ${
        connected ? "connected" : "disconnected"
      }`}</h1>
      <CodeMirror
        className=""
        height="100%"
        basicSetup={false}
        id="codeEditor"
        extensions={[
          indentUnit.of("\t"),
          basicSetup(),
          langs.python(),
          peerExtension(socket, documentName, version, nameRef.current),
          cursorExtension(nameRef.current),
        ]}
        value={doc}
      />
    </>
  );
};

SocketEditor.propTypes = {
  socket: PropTypes.object,
  documentName: PropTypes.string,
};

// problem: when want to grab a new document. the editor stays the same, just emits a change to doc
// but really would want to remove old editor and replace with new one in that case..
