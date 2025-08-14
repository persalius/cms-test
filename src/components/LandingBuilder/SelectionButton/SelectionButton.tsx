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
      <Card className="template-card gap-2">
        <CardHeader>
          <CardTitle className="text-center">{name}</CardTitle>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={onPreview}
            title="Просмотр шаблона"
            className="w-full cursor-pointer"
          >
            👁 Открыть редактор
          </Button>
          {onAdd && (
            <Button
              onClick={onAdd}
              title="Использовать шаблон"
              variant="outline"
              className="w-full cursor-pointer"
            >
              ✨ Использовать
            </Button>
          )}
        </CardFooter>
      </Card>
      {!onAdd && <Separator orientation="vertical" className="mx-8" />}
    </>
  );
};
