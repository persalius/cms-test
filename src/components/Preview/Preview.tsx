import { useInitializeFrame } from "./hooks/useInitializeFrame";
import { DEVICES } from "../../shared/constants/device";
import type {
  TemplateInstance,
  TemplateList,
} from "../../shared/types/template";
import type { FileList } from "../../shared/types/file";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";
import type { EditorState } from "@/shared/types/editor";
import type { LandingState } from "@/shared/types/landng";

interface Props {
  isFullView: boolean;
  editorState: EditorState;
  landingState: LandingState;
  activeHtml: string;
  device: keyof typeof DEVICES;
  templateInstances: TemplateInstance[];
  templates: TemplateList;
}

export const Preview = ({
  isFullView,
  editorState,
  landingState,
  activeHtml,
  device,
  templateInstances,
  templates,
}: Props) => {
  const editorType = editorState.type;
  const templateKey =
    editorState.type === "template" ? editorState.templateKey : undefined;

  const files = useMemo((): FileList => {
    if (editorState.type === "template") {
      // Для шаблонов передаем исходные файлы, компилятор сам создаст полный HTML
      return templates[editorState.templateKey] || {};
    }
    // Для лендинга передаем файлы с экземплярами шаблонов
    return landingState.files;
  }, [editorState, landingState.files, templates]);

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
      className={twMerge(
        isFullView ? "w-full" : "w-1/2",
        "h-full",
        "p-3",
        "flex",
        "justify-center",
        "bg-zinc-100"
      )}
    >
      <div
        className="border border-gray-300 overflow-hidden bg-white"
        style={{
          width: DEVICES[device].width,
          padding: DEVICES[device].px,
        }}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          title="HTML Preview"
          sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};
