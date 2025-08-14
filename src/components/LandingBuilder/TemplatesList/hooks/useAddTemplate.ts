import { useEditor } from "@/shared/editor/context";
import { useLanding } from "@/shared/landing/context";
import type { FileList } from "@/shared/types/file";
import { TemplateIntegrator } from "@/shared/utils/templateIntegrator";
import { useCallback } from "react";

export const useAddTemplate = () => {
  const { editorState } = useEditor();
  const { landingState, setLandingState } = useLanding();

  const handleAddTemplate = useCallback(
    (template: FileList) => {
      if (
        editorState.type !== "landing" ||
        !editorState.activeFile.endsWith(".html")
      ) {
        alert("Для добавления шаблона выберите HTML файл в Landing Page");
        return;
      }
      try {
        const updatedLandingState = TemplateIntegrator.addTemplateToLanding(
          landingState,
          template,
          editorState.activeFile
        );
        setLandingState(updatedLandingState);
      } catch (error) {
        alert(`Ошибка при добавлении шаблона ${error}`);
      }
    },
    [editorState.activeFile, editorState.type, landingState, setLandingState]
  );

  return { handleAddTemplate };
};
