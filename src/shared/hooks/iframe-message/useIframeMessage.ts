import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useTextUpdate } from "./useTextUpdate";
import { iFrameMessage } from "../../constants/iframe-message";
import { useTemplateEdit } from "./useTemplateEdit";

interface Props {
  setEditInstanceId: Dispatch<SetStateAction<string | null>>;
}

export const useIframeMessage = ({ setEditInstanceId }: Props) => {
  const { onUpdateText } = useTextUpdate();
  const { onUpdateTemplate } = useTemplateEdit({ setEditInstanceId });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const type = event.data.type as keyof typeof iFrameMessage;

      const actions = {
        [iFrameMessage.TEXT_UPDATED]: onUpdateText,
        [iFrameMessage.READY]: () => {},
        [iFrameMessage.TEMPLATE_EDIT]: onUpdateTemplate,
      };

      actions[type]?.(event);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onUpdateTemplate, onUpdateText]);
};
