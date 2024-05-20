import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { indentUnit } from "@codemirror/language";
import { useEffect, useState } from "react";
import { peerExtension, getDocument } from "../socket_utils/utils";
import "../styles/editor.css";

export const SocketEditor = (socket) => {
  const [doc, setDoc] = useState(null);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    console.log("socket", socket);

    async function setupEditor() {
      let { version, doc } = await getDocument(socket);
      console.log("version, doc in view", version, doc.toString());
      setVersion(version);
      setDoc(doc.toString());

      // socket.on("connect", () => {
      //   setConnected(true);
      // });
      // socket.on("disconnect", () => {
      //   setConnected(false);
      // });
    }
    setupEditor();
    return () => {
      console.log("disconnected component");
    };
  }, [socket]);

  if (!doc || version === null) return <p>loading...</p>;
  return (
    <CodeMirror
      className=""
      height="100%"
      basicSetup={false}
      id="codeEditor"
      extensions={[
        indentUnit.of("\t"),
        basicSetup(),
        langs.c(),
        peerExtension(socket, version),
      ]}
      value={doc}
    />
  );
};
