import type { Dispatch, SetStateAction } from "react";

interface Props {
  setEditInstanceId: Dispatch<SetStateAction<string | null>>;
}

export const useTemplateEdit = ({ setEditInstanceId }: Props) => {
  const onUpdateTemplate = (event: MessageEvent) => {
    const { instanceId } = event.data.payload;
    setEditInstanceId(instanceId);
  };

  return { onUpdateTemplate };
};
