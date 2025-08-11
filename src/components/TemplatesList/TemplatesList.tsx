// src/components/TemplatesList/TemplatesList.tsx
import type { FileList } from "../../shared/types/file";
import type { TemplateList } from "../../shared/types/template";
import { SelectionButton } from "../SelectionButton/SelectionButton";

type TemplatesListProps = {
  onAddTemplate: (template: FileList) => void;
  onPreviewTemplate: (templateKey: string) => void;
  templates: TemplateList;
};

export const TemplatesList = ({
  onAddTemplate,
  onPreviewTemplate,
  templates,
}: TemplatesListProps) => {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      {Object.entries(templates).map(([repoName, template]) => {
        const { name } = template["/template.json"]
          ? JSON.parse(template["/template.json"].code)
          : {};

        return (
          <SelectionButton
            key={repoName}
            name={name}
            onAdd={() => onAddTemplate(template)}
            onPreview={() => onPreviewTemplate(repoName)}
          />
        );
      })}
    </div>
  );
};
