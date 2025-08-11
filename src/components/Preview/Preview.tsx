import { useInitializeFrame } from "./hooks/useInitializeFrame";
import { DEVICES } from "../../shared/constants/device";
import type {
  TemplateInstance,
  TemplateList,
} from "../../shared/types/template";
import type { FileList } from "../../shared/types/file";

interface Props {
  files: FileList;
  activeHtml: string;
  device: keyof typeof DEVICES;
  templateInstances: TemplateInstance[];
  templates: TemplateList;
  editorType: "landing" | "template";
  templateKey?: string;
  onUpdateTemplateProps?: (
    instanceId: string,
    props: Record<string, string>
  ) => void;
}

export const Preview = ({
  files,
  activeHtml,
  device,
  templateInstances,
  templates,
  editorType,
  templateKey,
}:
Props) => {
  const { iframeRef } = useInitializeFrame({
    files,
    activeHtml,
    templateInstances,
    templates,
    editorType,
    templateKey,
  });

  return (
    <div
      style={{
        width: "50%",
        height: "100%",
        padding: 12,
        display: "flex",
        justifyContent: "center",
        background: "rgb(248, 250, 252)",
      }}
    >
      <div
        style={{
          width: DEVICES[device].width,
          padding: DEVICES[device].px,
          background: "white",
          border: "1px solid #ccc",
          overflow: "hidden",
        }}
      >
        <iframe
          ref={iframeRef}
          style={{
            width: "100%",
            height: "600px",
            border: "none",
          }}
          title="HTML Preview"
          sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};
