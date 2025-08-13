import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LandingState } from "@/shared/types/landng";
import { TemplateIntegrator } from "@/shared/utils/templateIntegrator";
import parse from "node-html-parser";

import {
  useMemo,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

interface Props {
  landingState: LandingState;
  previewInstanceId: string | null;
  onClose: () => void;
  setLandingState: Dispatch<SetStateAction<LandingState>>;
}

export function TemplateEditModal({
  previewInstanceId,
  onClose,
  landingState,
  setLandingState,
}: Props) {
  const templateInstance = landingState.templateInstances.find(
    (inst) => inst.id === previewInstanceId
  );

  const defaultAttributes = useMemo(() => {
    const filePath = templateInstance?.htmlFile;
    const fileEntry = filePath ? landingState.files[filePath] : null;
    if (!fileEntry) return null;
    const original = fileEntry.code;
    const root = parse(original, { lowerCaseTagName: false });

    const template =
      root.querySelector(`[templateId="${previewInstanceId}"]`) ||
      root.querySelector(`[templateid="${previewInstanceId}"]`) ||
      root.querySelector(`Template[templateId="${previewInstanceId}"]`) ||
      root.querySelector(`template[templateId="${previewInstanceId}"]`);
    if (!template) return null;

    const attrsObj = Object.keys(
      templateInstance?.templateConfig.attributes || {}
    ).reduce<Record<string, string>>((acc, attr) => {
      const val = template.getAttribute(attr);
      acc[attr] =
        val || templateInstance?.templateConfig.attributes[attr] || "";
      return acc;
    }, {});

    return attrsObj;
  }, [
    landingState.files,
    previewInstanceId,
    templateInstance?.htmlFile,
    templateInstance?.templateConfig.attributes,
  ]);

  const handleUpdateTemplateAttributes = (
    attributes: Record<string, string>
  ) => {
    if (!previewInstanceId) {
      return;
    }
    const updatedLandingState = TemplateIntegrator.updateTemplateAttributions(
      landingState,
      previewInstanceId,
      attributes
    );
    setLandingState(updatedLandingState);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const attributes = Object.fromEntries(formData.entries());
    handleUpdateTemplateAttributes(attributes as Record<string, string>);
    onClose();
  };

  return (
    <Dialog open={!!previewInstanceId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="flex gap-4 flex-col">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Make changes to your template here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {Object.keys(templateInstance?.templateConfig.attributes || {}).map(
              (attribute) => (
                <div className="grid gap-3" key="attribute">
                  <Label htmlFor={attribute} className="capitalize">
                    {attribute}
                  </Label>
                  <Input
                    id={attribute}
                    name={attribute}
                    defaultValue={defaultAttributes?.[attribute]}
                  />
                </div>
              )
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
