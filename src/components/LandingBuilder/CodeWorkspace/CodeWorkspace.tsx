import { useMemo } from "react";
import { Editor } from "../Editor/Editor";
import { FileExplorer } from "../FileExplorer";
import type { FileList } from "@/shared/types/file";
import { useEditor } from "@/shared/context/editor";
import { useTemplates } from "@/shared/context/template";
import { useLanding } from "@/shared/context/landing";

export const CodeWorkspace = () => {
  const { editorState, handleSelectFile } = useEditor();
  const { templates } = useTemplates();
  const { landingState } = useLanding();

  const editorFiles = useMemo((): FileList | null => {
    if (editorState.type === "template") {
      return templates[editorState.templateKey] || {};
    }
    if (editorState.type === "landing") {
      return landingState.files;
    }

    return null;
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
