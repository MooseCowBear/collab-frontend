import "./App.css";
import { SocketEditor } from "./components/SocketEditor";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api",
});

//import { Editor } from "./components/Editor";
//import { CollabEditor } from "./components/CollabEditor";

function App() {
  return (
    <>
      <SocketEditor socket={socket} />
    </>
  );
}

export default App;
