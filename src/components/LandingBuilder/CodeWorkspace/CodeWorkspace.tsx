import { useMemo } from "react";
import { Editor } from "../Editor/Editor";
import { FileExplorer } from "../FileExplorer";
import type { FileList } from "@/shared/types/file";
import { useEditor } from "@/shared/editor/context";
import { useTemplates } from "@/shared/template/context";
import { useLanding } from "@/shared/landing/context";

export const CodeWorkspace = () => {
  const { editorState, handleSelectFile } = useEditor();
  const { templates } = useTemplates();
  const { landingState } = useLanding();

  const editorFiles = useMemo((): FileList => {
    return editorState.type === "landing"
      ? landingState.files
      : templates[editorState.templateKey] || {};
  }, [editorState, landingState.files, templates]);

  return (
    <>
      <FileExplorer
        files={editorFiles}
        onSelectFile={handleSelectFile}
        activeFile={editorState.activeFile}
      />
      <Editor files={editorFiles} activeFile={editorState.activeFile} />
    </>
  );
};
