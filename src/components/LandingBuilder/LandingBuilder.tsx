import { useState } from "react";
import { TemplateEditModal } from "@/components/LandingBuilder/Template/TemplateEditModal/TemplateEditModal";
import { CodeWorkspace } from "@/components/LandingBuilder/CodeWorkspace/CodeWorkspace";
import { EditorProvider } from "@/shared/editor/context";
import { LandingButton } from "@/components/LandingBuilder/LandingButton/LandingButton";
import type { Device } from "@/shared/types/device";
import { useIframeMessage } from "@/shared/hooks/iframe-message/useIframeMessage";
import { TemplatesList } from "./TemplatesList/TemplatesList";
import { DeviceSelector } from "./DeviceSelector";
import { Preview } from "./Preview/Preview";

export default function LandingBuilder() {
  const [device, setDevice] = useState<Device>("desktop");
  const [isFullView, setIsFullView] = useState(false);
  const [editInstanceId, setEditInstanceId] = useState<string | null>(null);

  useIframeMessage({ setEditInstanceId });

  return (
    <EditorProvider>
      <div className="flex flex-col h-screen p-4">
        <TemplateEditModal
          editInstanceId={editInstanceId}
          onClose={() => setEditInstanceId(null)}
        />

        <div className="flex gap-3 mb-3">
          <LandingButton />
          <TemplatesList />
        </div>

        <DeviceSelector
          device={device}
          setDevice={setDevice}
          setIsFullView={setIsFullView}
        />
        <div className="flex items-start box-border flex-1 min-h-0">
          {!isFullView && <CodeWorkspace />}
          <Preview isFullView={isFullView} device={device} />
        </div>
      </div>
    </EditorProvider>
  );
}
