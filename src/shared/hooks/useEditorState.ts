import { useState } from "react";

interface LandingEditorState {
  type: "landing";
  activeFile: string;
  activeHtml: string;
}

interface TemplateEditorState {
  type: "template";
  activeFile: string;
  activeHtml: string;
  templateKey: string; // обязательный для template
}

export type EditorState = LandingEditorState | TemplateEditorState;

export const useEditorState = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    type: "landing",
    activeFile: "/index.html",
    activeHtml: "/index.html",
  });

  return { editorState, setEditorState };
};
