import { useEditor } from "@/shared/editor/context";
import { SelectionButton } from "../SelectionButton/SelectionButton";

export const LandingButton = () => {
  const { handleEditLanding } = useEditor();

  return <SelectionButton name="Landing page" onPreview={handleEditLanding} />;
};
