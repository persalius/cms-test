import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { EditorState } from "../../types/editor";
import type { LandingState } from "../../types/landng";
import { useTextUpdate } from "./useTextUpdate";
import { iFrameMessage } from "../../constants/iframe-message";
import { useTemplateEdit } from "./useTemplateEdit";

interface Props {
  editorState: EditorState;
  landingState: LandingState;
  setLandingState: Dispatch<SetStateAction<LandingState>>;
}

export const useIframeMessage = ({
  editorState,
  landingState,
  setLandingState,
}: Props) => {
  const { onUpdateText } = useTextUpdate({
    editorState,
    landingState,
    setLandingState,
  });

  const { onUpdateTemplate } = useTemplateEdit({
    landingState,
    setLandingState,
  });

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
