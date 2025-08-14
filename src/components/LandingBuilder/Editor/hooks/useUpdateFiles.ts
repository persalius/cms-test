import { useEditor } from "@/shared/editor/context";
import { useLanding } from "@/shared/landing/context";
import { useTemplates } from "@/shared/template/context";
import { useCallback } from "react";

export const useUpdateFiles = () => {
  const { editorState } = useEditor();
  const { onUpdateTemplates } = useTemplates();
  const { onUpdateLandingFiles } = useLanding();

  const onUpdateFiles = useCallback(
    (file: string, value: string) => {
      if (editorState.type === "landing") {
        onUpdateLandingFiles(file, value);
      } else {
        onUpdateTemplates(editorState.templateKey, file, value);
      }
    },
    [editorState, onUpdateLandingFiles, onUpdateTemplates]
  );

  return { onUpdateFiles };
};
