import type { Dispatch, SetStateAction } from "react";

interface Props {
  setPreviewInstanceId: Dispatch<SetStateAction<string | null>>;
}

export const useTemplateEdit = ({ setPreviewInstanceId }: Props) => {
  const onUpdateTemplate = (event: MessageEvent) => {
    const { instanceId } = event.data.payload;
    setPreviewInstanceId(instanceId);
  };

  return { onUpdateTemplate };
};
