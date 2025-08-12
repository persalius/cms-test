import { useCallback, useEffect, useMemo, useState } from "react";
import { parse } from "node-html-parser";
import { useLanding } from "../shared/hooks/useLanding";
import { Editor } from "../components/Editor/Editor";
import type { Device } from "../shared/types/device";
import { DeviceSelector } from "../components/DeviceSelector";
import { FileExplorer } from "../components/FileExplorer";
import type { FileList } from "../shared/types/file";
import { Preview } from "../components/Preview/Preview";
import { useTemplates } from "../shared/hooks/useTemplates";
import { TemplatesList } from "../components/TemplatesList/TemplatesList";
import { SelectionButton } from "../components/SelectionButton/SelectionButton";
import { useEditorState } from "../shared/hooks/useEditorState";
import { useEditorActions } from "../shared/hooks/useEditorActions";
import { TemplateIntegrator } from "../shared/utils/templateIntegrator";
import { useIframeMessage } from "../shared/hooks/iframe-message/useIframeMessage";

export default function EditorPage() {
  // Device
  const [device, setDevice] = useState<Device>("desktop");

  // Files
  const { templates, onUpdateTemplates } = useTemplates();
  const { landingState, setLandingState, onUpdateLandingFiles } = useLanding();

  // Editor State
  const { editorState, setEditorState } = useEditorState();
  const {
    handleEditLanding,
    handleEditTemplate,
    handleSelectFile,
    handleUpdateFiles,
  } = useEditorActions({
    editorState,
    setEditorState,
    onUpdateLandingFiles,
    onUpdateTemplates,
  });

  // Iframe messages
  useIframeMessage({ editorState, landingState, setLandingState });

  // Файлы для Editor (исходные)
  const editorFiles = useMemo((): FileList => {
    return editorState.type === "landing"
      ? landingState.files
      : templates[editorState.templateKey] || {};
  }, [editorState, landingState.files, templates]);

  // Файлы для Preview (разные в зависимости от режима)
  const previewFiles = useMemo((): FileList => {
    if (editorState.type === "template") {
      // Для шаблонов передаем исходные файлы, компилятор сам создаст полный HTML
      return templates[editorState.templateKey] || {};
    }
    // Для лендинга передаем файлы с экземплярами шаблонов
    return landingState.files;
  }, [editorState, landingState.files, templates]);

  // Функция добавления шаблона
  const handleAddTemplate = useCallback(
    (template: FileList, props: Record<string, string> = {}) => {
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
          props,
          editorState.activeFile
        );

        setLandingState(updatedLandingState);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        alert("Ошибка при добавлении шаблона");
      }
    },
    [editorState, landingState, setLandingState]
  );

  // Функция обновления пропсов шаблона
  // const handleUpdateTemplateProps = useCallback(
  //   (instanceId: string, props: Record<string, string>) => {
  //     const updatedLandingState = TemplateIntegrator.updateTemplateProps(
  //       landingState,
  //       instanceId,
  //       props
  //     );
  //     setLandingState(updatedLandingState);
  //   },
  //   [landingState, setLandingState]
  // );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "1rem",
      }}
    >
      {/* items list */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <SelectionButton name="Landing page" onPreview={handleEditLanding} />
        <TemplatesList
          templates={templates}
          onAddTemplate={handleAddTemplate}
          onPreviewTemplate={handleEditTemplate}
        />
      </div>

      {/* main */}
      <DeviceSelector device={device} setDevice={setDevice} />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          height: "500px",
          boxSizing: "border-box",
          flex: 1,
        }}
      >
        <FileExplorer
          files={editorFiles}
          onSelectFile={handleSelectFile}
          activeFile={editorState.activeFile}
        />
        <Editor
          files={editorFiles}
          updateFiles={handleUpdateFiles}
          activeFile={editorState.activeFile}
        />
        <Preview
          files={previewFiles}
          activeHtml={editorState.activeHtml}
          device={device}
          templateInstances={landingState.templateInstances}
          templates={templates}
          editorType={editorState.type}
          templateKey={
            editorState.type === "template"
              ? editorState.templateKey
              : undefined
          }
        />
      </div>
    </div>
  );
}
