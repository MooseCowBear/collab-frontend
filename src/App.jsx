import { useState } from "react";
import "./App.css";
import { SocketEditor } from "./components/SocketEditor";
import { io } from "socket.io-client";
import { Editor } from "./components/Editor";

const socket = io("http://localhost:3000", {
  path: "/api",
});

function App() {
  const [collab, setCollab] = useState(true);

  const disconnect = () => {
    socket.disconnect();
  };

  const reconnect = () => {
    console.log("reconnect clicked");
    socket.connect();
  };

  return (
    <>
      {collab ? (
        <>
          <SocketEditor socket={socket} />
          <button onClick={disconnect}>Disconnect</button>
          <button onClick={reconnect}>Reconnect</button>
        </>
      ) : (
        <Editor />
      )}
      <button onClick={() => setCollab(!collab)}>Toggle Collab</button>
    </>
  );
}

export default App;

// note: passing the docName as a prop causes
// Unhandled Promise Rejection: TypeError: JSON.stringify cannot serialize cyclic structures.
// 107 in utils
