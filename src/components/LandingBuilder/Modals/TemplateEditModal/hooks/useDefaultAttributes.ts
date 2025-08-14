import { useLanding } from "@/shared/context/landing";
import { getTemplateFromHtml } from "@/shared/utils/getTemplateFromHtml";
import parse from "node-html-parser";
import { useMemo } from "react";

interface Props {
  editInstanceId: string | null;
}

export const useDefaultAttributes = ({ editInstanceId }: Props) => {
  const { landingState } = useLanding();

  const templateInstance = landingState.templateInstances.find(
    (inst) => inst.id === editInstanceId
  );

  const defaultAttributes = useMemo(() => {
    const filePath = templateInstance?.htmlFile;
    const fileEntry = filePath ? landingState.files[filePath] : null;

    if (!fileEntry || !editInstanceId) return null;
    const original = fileEntry.code;
    const root = parse(original, { lowerCaseTagName: false });

    const template = getTemplateFromHtml({
      html: root,
      instanceId: editInstanceId,
    });
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
    editInstanceId,
    templateInstance?.htmlFile,
    templateInstance?.templateConfig.attributes,
  ]);

  return { defaultAttributes, templateInstance };
};
