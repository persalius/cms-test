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
