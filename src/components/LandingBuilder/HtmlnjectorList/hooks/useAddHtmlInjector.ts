import { useEditor } from "@/shared/context/editor";
import { useLanding } from "@/shared/context/landing";
import type { FileList } from "@/shared/types/file";
import { HtmlInjectorIntegrator } from "@/shared/utils/htmlInjectorIntegrator";
import { useCallback } from "react";

export const useAddHtmlInjector = () => {
  const { editorState } = useEditor();
  const { landingState, setLandingState } = useLanding();

  const handleAddHtmlInjector = useCallback(
    (htmlInjector: FileList) => {
      if (
        editorState.type !== "landing" ||
        !editorState.activeFile.endsWith(".html")
      ) {
        alert("Для добавления injector выберите HTML файл в Landing Page");
        return;
      }

      try {
        const updatedLandingState =
          HtmlInjectorIntegrator.addHtmlInjectorToLanding(
            landingState,
            htmlInjector,
            editorState.activeFile
          );
        setLandingState(updatedLandingState);
      } catch (error) {
        alert(`Ошибка при добавлении injector ${error}`);
      }
    },
    [editorState.activeFile, editorState.type, landingState, setLandingState]
  );

  return { handleAddHtmlInjector };
};
