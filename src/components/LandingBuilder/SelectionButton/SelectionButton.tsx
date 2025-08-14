import { Button } from "../ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface Props {
  name?: string;
  onPreview: () => void;
  onAdd?: () => void;
}

export const SelectionButton = ({ name, onPreview, onAdd }: Props) => {
  return (
    <>
      <Card className="template-card gap-2 py-2 w-full max-w-60">
        <CardHeader>
          <CardTitle className="text-center">{name}</CardTitle>
        </CardHeader>
        <CardFooter className="flex gap-2">
          <Button
            onClick={onPreview}
            title="Просмотр шаблона"
            className="flex-1 cursor-pointer"
          >
            👁 Edit
          </Button>
          {onAdd && (
            <Button
              onClick={onAdd}
              title="Использовать шаблон"
              variant="outline"
              className="flex-1 cursor-pointer"
            >
              ✨ Use
            </Button>
          )}
        </CardFooter>
      </Card>
      {!onAdd && <Separator orientation="vertical" className="mx-8" />}
    </>
  );
};
