import { useState } from "react";
import type { EditorState } from "../types/editor";

export const useEditorState = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    type: "landing",
    activeFile: "/index.html",
    activeHtml: "/index.html",
  });

  return { editorState, setEditorState };
};
