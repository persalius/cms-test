import { useMemo } from "react";
import { useLanding } from "@/shared/context/landing";
import {
  extractTemplateAttributes,
  getTemplateFromHtml,
} from "@/shared/utils/template";
import { parseHtml } from "@/shared/utils/parser";
import { useTemplates } from "@/shared/context/template";

interface Props {
  editInstanceId: string | null;
}

export const useDefaultAttributes = ({ editInstanceId }: Props) => {
  const { landingState } = useLanding();
  const { templates } = useTemplates();

  const templateInstance = landingState.templateInstances.find(
    (inst) => inst.id === editInstanceId
  );

  const currentTemplateHtml = templateInstance?.templateId
    ? templates[templateInstance?.templateId][templateInstance?.htmlFile].code
    : null;
  const attributes = useMemo(
    () =>
      currentTemplateHtml ? extractTemplateAttributes(currentTemplateHtml) : {},
    [currentTemplateHtml]
  );

  const defaultAttributes = useMemo(() => {
    const filePath = templateInstance?.htmlFile;
    const fileEntry = filePath ? landingState.files[filePath] : null;

    if (!fileEntry || !editInstanceId) return null;
    const original = fileEntry.code;
    const root = parseHtml(original);

    const template = getTemplateFromHtml({
      html: root,
      instanceId: editInstanceId,
    });

    if (!template) return null;

    const attrsObj = Object.keys(attributes).reduce<Record<string, string>>(
      (acc, attr) => {
        const val = template.getAttribute(attr);
        acc[attr] = val || attributes[attr] || "";
        return acc;
      },
      {}
    );

    return attrsObj;
  }, [
    attributes,
    editInstanceId,
    landingState.files,
    templateInstance?.htmlFile,
  ]);

  return { defaultAttributes, attributes };
};
