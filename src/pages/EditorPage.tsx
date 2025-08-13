import { useCallback, useState } from "react";
import { useLanding } from "../shared/hooks/useLanding";
import type { Device } from "../shared/types/device";
import { DeviceSelector } from "../components/DeviceSelector";
import type { FileList } from "../shared/types/file";
import { Preview } from "../components/Preview/Preview";
import { useTemplates } from "../shared/hooks/useTemplates";
import { TemplatesList } from "../components/TemplatesList/TemplatesList";
import { SelectionButton } from "../components/SelectionButton/SelectionButton";
import { useEditorState } from "../shared/hooks/useEditorState";
import { useEditorActions } from "../shared/hooks/useEditorActions";
import { TemplateIntegrator } from "../shared/utils/templateIntegrator";
import { useIframeMessage } from "../shared/hooks/iframe-message/useIframeMessage";
import { TemplateEditModal } from "@/components/Template/TemplateEditModal";
import { CodeWorkspace } from "@/components/CodeWorkspace/CodeWorkspace";

export default function EditorPage() {
  // Settings
  const [device, setDevice] = useState<Device>("desktop");
  const [isFullView, setIsFullView] = useState(false);
  const [previewInstanceId, setPreviewInstanceId] = useState<string | null>(
    null
  );

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
  useIframeMessage({
    editorState,
    landingState,
    setLandingState,
    setPreviewInstanceId,
  });

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "1rem",
      }}
    >
      <TemplateEditModal
        previewInstanceId={previewInstanceId}
        onClose={() => setPreviewInstanceId(null)}
        landingState={landingState}
        setLandingState={setLandingState}
      />

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
      <DeviceSelector
        device={device}
        setDevice={setDevice}
        setIsFullView={setIsFullView}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          height: "500px",
          boxSizing: "border-box",
          flex: 1,
        }}
      >
        {!isFullView && (
          <CodeWorkspace
            landingState={landingState}
            templates={templates}
            onSelectFile={handleSelectFile}
            onUpdateFiles={handleUpdateFiles}
            editorState={editorState}
          />
        )}
        <Preview
          editorState={editorState}
          landingState={landingState}
          isFullView={isFullView}
          activeHtml={editorState.activeHtml}
          device={device}
          templateInstances={landingState.templateInstances}
          templates={templates}
        />
      </div>
    </div>
  );
}
