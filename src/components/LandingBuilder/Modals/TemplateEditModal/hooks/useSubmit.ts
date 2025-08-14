import type { FormEvent } from "react";
import { useLanding } from "@/shared/landing/context";
import { TemplateIntegrator } from "@/shared/utils/templateIntegrator";

interface Props {
  editInstanceId: string | null;
  onClose: () => void;
}

export const useSubmit = ({ editInstanceId, onClose }: Props) => {
  const { landingState, setLandingState } = useLanding();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!editInstanceId) return;
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const attributes = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    const updatedLandingState = TemplateIntegrator.updateTemplateAttributions(
      landingState,
      editInstanceId,
      attributes
    );
    setLandingState(updatedLandingState);

    onClose();
  };

  return { handleSubmit };
};
