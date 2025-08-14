import type { Dispatch, SetStateAction } from "react";

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

export type EditorStateType = LandingEditorState | TemplateEditorState;

export type EditorContextType = {
  editorState: EditorStateType;
  setEditorState: Dispatch<SetStateAction<EditorStateType>>;
  handleEditLanding: () => void;
  handleEditTemplate: (templateKey: string) => void;
  handleSelectFile: (path: string) => void;
};
