import { HTMLElement } from "node-html-parser";
import type { FileList } from "../types/file";
import type {
  TemplateConfig,
  TemplateInstance,
  TemplateList,
} from "../types/template";
import type { LandingState } from "../context/landing/types";

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

export const extractTemplateAttributes = (
  html: string
): Record<string, string> => {
  const result: Record<string, string> = {};
  const regex = /\{([\w-]+)(?:=([^}]*))?\}/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const key = match[1];
    const value = match[2] ?? "";
    result[key] = value;
  }
  return result;
};

export const getTemplateHtmlFile = (templateFiles: FileList): string => {
  for (const filePath of Object.keys(templateFiles)) {
    if (filePath.startsWith("/src/") && filePath.endsWith(".html")) {
      return templateFiles[filePath].code;
    }
  }
  return "";
};

export const transfomTemplateString = (value: string) => {
  return value.replace(/<Template([^>]*)\s*><\/Template>/g, (match, attrs) => {
    const cleanedAttrs = attrs.replace(/\s+$/, "");
    return `<Template${cleanedAttrs} />`;
  });
};

export const parseTemplateConfig = (
  templateFiles: FileList
): TemplateConfig | null => {
  try {
    const configCode = templateFiles["/config.json"]?.code;
    if (!configCode) return null;

    const config = JSON.parse(configCode);

    if (!config.id) {
      console.error("Invalid template config:", config);
      return null;
    }

    return config;
  } catch (error) {
    console.error("Failed to parse template config:", error);
    return null;
  }
};

export const getFilePathInBrowser = (filePath: string): string | null => {
  const lastSlashIndex = filePath.lastIndexOf("/");
  const fileName =
    lastSlashIndex !== -1 ? filePath.substring(lastSlashIndex) : "";

  if (filePath.endsWith(".css") && fileName) {
    const cssFilePath = `/css${fileName}`;
    return cssFilePath;
  }

  if (filePath.endsWith(".js") && fileName) {
    const jsFilePath = `/scripts${fileName}`;
    return jsFilePath;
  }

  return null;
};

export const getTemplateSrcFiles = (templateFiles: FileList): FileList => {
  const rootDir = "src";
  const files: FileList = {};

  Object.keys(templateFiles).forEach((filePath) => {
    const file = templateFiles[filePath];

    if (!filePath.startsWith(`/${rootDir}/`)) {
      return null;
    }

    const lastSlashIndex = filePath.lastIndexOf("/");
    const fileName =
      lastSlashIndex !== -1 ? filePath.substring(lastSlashIndex) : "";

    if (filePath.endsWith(".css") && fileName) {
      const cssFilePath = getFilePathInBrowser(filePath);
      if (cssFilePath) {
        files[cssFilePath] = file;
      }
    }

    if (filePath.endsWith(".js") && fileName) {
      const jsFilePath = getFilePathInBrowser(filePath);
      if (jsFilePath) {
        files[jsFilePath] = file;
      }
    }
  });

  return files;
};

export const getUniqueUsedTemplates = (
  arr: TemplateInstance[],
  templates: TemplateList
) => {
  const uniqueTemplates = Object.values(templates).filter((template) => {
    const { id } = parseTemplateConfig(template) || {};
    return arr.some((item) => item.templateId === id);
  });

  return uniqueTemplates;
};

export const getTemplateFilesForCurrentPage = ({
  landingState,
  activeHtml,
  templates,
}: {
  landingState: LandingState;
  activeHtml?: string;
  templates: TemplateList;
}) => {
  if (!activeHtml) return {};

  const filteredInstances: string[] = landingState.templateInstances
    .filter((instance) => instance.htmlFile === activeHtml)
    .map((instance) => instance.templateId);

  const filteredTemplates = filteredInstances.length
    ? Object.values(templates).filter((template) => {
        const { id } = parseTemplateConfig(template) || {};
        return filteredInstances.includes(id || "");
      })
    : [];

  const templateFiles: FileList = filteredTemplates.reduce(
    (accumulator, template) => {
      const files = getTemplateSrcFiles(template);
      return { ...accumulator, ...files };
    },
    {}
  );

  return templateFiles;
};

export const getLinkInBrowser = (filePath: string): string | null => {
  if (filePath.endsWith(".css")) {
    return `<link rel="stylesheet" href="${filePath}" />`;
  }

  if (filePath.endsWith(".js")) {
    return `<script src="${filePath}"></script>`;
  }

  return null;
};
