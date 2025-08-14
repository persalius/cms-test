import { useCallback, useMemo, useState, type ReactNode } from "react";

import { EditorContext } from "./context";
import type { EditorContextType, EditorStateType } from "./types";

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [editorState, setEditorState] = useState<EditorStateType>({
    type: "landing",
    activeFile: "/index.html",
    activeHtml: "/index.html",
  });

  const handleEditLanding = useCallback(() => {
    setEditorState({
      type: "landing",
      activeFile: "/index.html",
      activeHtml: "/index.html",
    });
  }, []);

  const handleEditTemplate = useCallback((templateKey: string) => {
    setEditorState({
      type: "template",
      activeFile: "/index.html",
      activeHtml: "/index.html",
      templateKey,
    });
  }, []);

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

  const contextValue: EditorContextType = useMemo(
    () => ({
      editorState,
      setEditorState,
      handleEditLanding,
      handleEditTemplate,
      handleSelectFile,
    }),
    [editorState, handleEditLanding, handleEditTemplate, handleSelectFile]
  );

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};
