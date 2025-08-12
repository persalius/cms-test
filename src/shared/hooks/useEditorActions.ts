import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { EditorState } from "../types/editor";


interface Props {
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
  onUpdateLandingFiles: (file: string, value: string) => void;
  onUpdateTemplates: (templateKey: string, file: string, value: string) => void;
}

export const useEditorActions = ({
  editorState,
  setEditorState,
  onUpdateLandingFiles,
  onUpdateTemplates,
}: Props) => {
  // Переключение на редактирование landing
  const handleEditLanding = () => {
    setEditorState({
      type: "landing",
      activeFile: "/index.html",
      activeHtml: "/index.html",
    });
  };

  // Переключение на редактирование шаблона
  const handleEditTemplate = (templateKey: string) => {
    setEditorState({
      type: "template",
      activeFile: "/index.html",
      activeHtml: "/index.html",
      templateKey,
    });
  };

  // Выбор файла
  const handleSelectFile = useCallback(
    (path: string) => {
      setEditorState((prev) => ({
        ...prev,
        activeFile: path,
        activeHtml: path.endsWith(".html") ? path : prev.activeHtml,
      }));
    },
    [setEditorState]
  );

  // Обновление файлов
  const handleUpdateFiles = useCallback(
    (file: string, value: string) => {
      if (editorState.type === "landing") {
        return onUpdateLandingFiles(file, value);
      }

      onUpdateTemplates(editorState.templateKey, file, value);
    },
    [editorState, onUpdateLandingFiles, onUpdateTemplates]
  );

  return {
    handleEditLanding,
    handleEditTemplate,
    handleSelectFile,
    handleUpdateFiles,
  };
};
