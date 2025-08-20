import { useEditor } from "@/shared/context/editor";
import { useLanding } from "@/shared/context/landing";
import { useTemplates } from "@/shared/context/template";
import { useCallback } from "react";

export const useUpdateFiles = () => {
  const { editorState } = useEditor();
  const { onUpdateTemplates } = useTemplates();
  const { onUpdateLandingFiles } = useLanding();

  const onUpdateFiles = useCallback(
    (file: string, value: string) => {
      if (editorState.type === "landing") {
        return onUpdateLandingFiles(file, value);
      }
      if (editorState.type === "template") {
        return onUpdateTemplates(editorState.templateKey, file, value);
      }
    },
    [editorState, onUpdateLandingFiles, onUpdateTemplates]
  );

  return { onUpdateFiles };
};
