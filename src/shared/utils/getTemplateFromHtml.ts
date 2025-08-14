import { HTMLElement } from "node-html-parser";

interface Props {
  html: HTMLElement;
  instanceId: string;
}

export const getTemplateFromHtml = ({ html, instanceId }: Props) => {
  const template =
    html.querySelector(`[templateId="${instanceId}"]`) ||
    html.querySelector(`[templateid="${instanceId}"]`) ||
    html.querySelector(`Template[templateId="${instanceId}"]`) ||
    html.querySelector(`template[templateId="${instanceId}"]`);

  return template;
};
