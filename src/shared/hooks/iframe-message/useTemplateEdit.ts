import type { Dispatch, SetStateAction } from "react";
import type { LandingState } from "../../types/landng";
import { TemplateIntegrator } from "../../utils/templateIntegrator";

interface Props {
  landingState: LandingState;
  setLandingState: Dispatch<SetStateAction<LandingState>>;
}

export const useTemplateEdit = ({ landingState, setLandingState }: Props) => {
  const onUpdateTemplate = (event: MessageEvent) => {
    const { instanceId } = event.data.payload;
    const updatedLandingState = TemplateIntegrator.updateTemplateAttributions(
      landingState,
      instanceId,
      { title: "New text" }
    );
    setLandingState(updatedLandingState);
  };

  return { onUpdateTemplate };
};
