import type { Dispatch, SetStateAction } from "react";

interface LandingEditorState {
  type: "landing";
}

interface TemplateEditorState {
  type: "template";
  templateKey: string;
}

export type EditorStateType = (LandingEditorState | TemplateEditorState) & {
  activeFile: string;
  activeHtml?: string;
};

export type EditorContextType = {
  editorState: EditorStateType;
  setEditorState: Dispatch<SetStateAction<EditorStateType>>;
  handleEditLanding: () => void;
  handleEditTemplate: (templateKey: string) => void;
  handleSelectFile: (path: string) => void;
};
