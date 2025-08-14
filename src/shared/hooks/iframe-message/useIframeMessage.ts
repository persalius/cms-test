import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useUpdateText } from "./useUpdateText";
import { iFrameMessage } from "../../constants/iframe-message";
import { useUpdateTemplate } from "./useUpdateTemplate";
import { useUpdateImage } from "./useUpdateImage";

interface Props {
  setEditInstanceId: Dispatch<SetStateAction<string | null>>;
  setEditImageSelector: Dispatch<SetStateAction<string | null>>;
}

export const useIframeMessage = ({
  setEditInstanceId,
  setEditImageSelector,
}: Props) => {
  const { onUpdateText } = useUpdateText();
  const { onUpdateTemplate } = useUpdateTemplate({ setEditInstanceId });
  const { onUpdateImage } = useUpdateImage({ setEditImageSelector });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const type = event.data.type as keyof typeof iFrameMessage;

      const actions = {
        [iFrameMessage.TEXT_UPDATED]: onUpdateText,
        [iFrameMessage.READY]: () => {},
        [iFrameMessage.TEMPLATE_EDIT]: onUpdateTemplate,
        [iFrameMessage.IMAGE_EDIT]: onUpdateImage,
      };

      actions[type]?.(event);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onUpdateImage, onUpdateTemplate, onUpdateText]);
};
