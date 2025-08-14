import { Button } from "@/components/LandingBuilder/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/LandingBuilder/ui/dialog";
import { Input } from "@/components/LandingBuilder/ui/input";
import { Label } from "@/components/LandingBuilder/ui/label";
import { useDefaultAttributes } from "./hooks/useDefaultAttributes";
import { useSubmit } from "./hooks/useSubmit";

interface Props {
  editInstanceId: string | null;
  onClose: () => void;
}

export function TemplateEditModal({ editInstanceId, onClose }: Props) {
  const { defaultAttributes, templateInstance } = useDefaultAttributes({
    editInstanceId,
  });
  const { handleSubmit } = useSubmit({ editInstanceId, onClose });

  return (
    <Dialog open={!!editInstanceId} onOpenChange={onClose}>
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
