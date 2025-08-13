import { useMemo } from "react";
import { Editor } from "../Editor/Editor";
import { FileExplorer } from "../FileExplorer";
import type { EditorState } from "@/shared/types/editor";
import type { LandingState } from "@/shared/types/landng";
import type { TemplateList } from "@/shared/types/template";
import type { FileList } from "@/shared/types/file";

interface Props {
  landingState: LandingState;
  templates: TemplateList;
  onSelectFile: (path: string) => void;
  onUpdateFiles: (file: string, value: string) => void;
  editorState: EditorState;
}

export const CodeWorkspace = ({
  landingState,
  templates,
  onSelectFile,
  onUpdateFiles,
  editorState,
}: Props) => {
  const editorFiles = useMemo((): FileList => {
    return editorState.type === "landing"
      ? landingState.files
      : templates[editorState.templateKey] || {};
  }, [editorState, landingState.files, templates]);

  return (
    <>
      <FileExplorer
        files={editorFiles}
        onSelectFile={onSelectFile}
        activeFile={editorState.activeFile}
      />
      <Editor
        files={editorFiles}
        onUpdateFiles={onUpdateFiles}
        activeFile={editorState.activeFile}
      />
    </>
  );
};
