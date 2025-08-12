import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { EditorState } from "../../types/editor";
import type { LandingState } from "../../types/landng";
import { useTextUpdated } from "./useTextUpdated";
import { iFrameMessage } from "../../constants/iframe-message";

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
  const { onUpdateText } = useTextUpdated({
    editorState,
    landingState,
    setLandingState,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const type = event.data.type as keyof typeof iFrameMessage;

      const actions = {
        [iFrameMessage.TEXT_UPDATED]: onUpdateText,
        [iFrameMessage.READY]: () => {},
        [iFrameMessage.TEMPLATE_EDIT]: () => {},
      };

      actions[type]?.(event);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onUpdateText]);
};
