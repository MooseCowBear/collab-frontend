import "./App.css";
import { SocketEditor } from "./components/SocketEditor";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api",
});

function App() {
  const disconnect = () => {
    socket.disconnect();
  };

  const reconnect = () => {
    console.log("reconnect clicked");
    socket.connect();
  };

  return (
    <>
      <SocketEditor socket={socket} />
      <button onClick={disconnect}>Disconnect</button>
      <button onClick={reconnect}>Reconnect</button>
    </>
  );
}

export default App;

// note: passing the docName as a prop causes Unhandled Promise Rejection: TypeError: JSON.stringify cannot serialize cyclic structures.
// 107 in utils
