import type { Dispatch, SetStateAction } from "react";

interface Props {
  setEditImageSelector: Dispatch<SetStateAction<string | null>>;
}

export const useUpdateImage = ({ setEditImageSelector }: Props) => {
  const onUpdateImage = (event: MessageEvent) => {
    const { selector } = event.data.payload;
    setEditImageSelector(selector);
  };

  return { onUpdateImage };
};
