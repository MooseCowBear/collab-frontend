import { useState } from "react";
import { SocketEditor } from "./components/SocketEditor";
import { io } from "socket.io-client";
import { Editor } from "./components/Editor";

import "./App.css";

const socket = io("http://localhost:3000", {
  path: "/api",
});

function App() {
  const [collab, setCollab] = useState(true);
  const [documentName, setDocumentName] = useState("two"); // ok reading from file if start from it, but not if change to it

  const disconnect = () => {
    socket.disconnect();
  };

  const reconnect = () => {
    console.log("reconnect clicked");
    socket.connect();
  };

  const save = () => {
    socket.emit("save", documentName);
  };

  return (
    <>
      {collab ? (
        <>
          <SocketEditor socket={socket} documentName={documentName} />
          <button onClick={disconnect}>Disconnect</button>
          <button onClick={reconnect}>Reconnect</button>
          <button onClick={save}>Save</button>
        </>
      ) : (
        <Editor />
      )}
      <button onClick={() => setCollab(!collab)}>Toggle Collab</button>
    </>
  );
}

export default App;

// couldn't get it to switch between documents by setting state
// also now regular editor not working