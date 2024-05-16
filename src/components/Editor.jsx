import { useRef } from "react";

export const Editor = () => {
  const editor = useRef();
  return <div ref={editor}></div>;
};
