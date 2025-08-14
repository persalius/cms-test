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
import { useSubmit } from "./hooks/useSubmit";

interface Props {
  editImageSelector: string | null;
  onClose: () => void;
}

export function ImageEditModal({ editImageSelector, onClose }: Props) {
  const { handleSubmit } = useSubmit({ editImageSelector, onClose });

  return (
    <Dialog open={!!editImageSelector} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="flex gap-4 flex-col">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Make changes to your image here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="image-path" className="capitalize">
                Image Path
              </Label>
              <Input id="image-path" name="image-path" />
            </div>
            <div className="flex justify-center">--------- or ---------</div>
            <div className="grid gap-3">
              <Label htmlFor="picture">Picture</Label>
              <Input id="picture" type="file" name="picture" />
            </div>
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
