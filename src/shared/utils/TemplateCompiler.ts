import type { FileList } from "../types/file";
import type { TemplateInstance, TemplateConfig } from "../types/template";
import type { TemplateList } from "../types/template";
import type { SandpackBundlerFiles } from "@codesandbox/sandpack-client";
import { TemplateParser } from "./templateParser";

export class TemplateCompiler {
  // Компилирует файлы для Sandpack Preview
  static compileForSandpack(
    sourceFiles: FileList,
    templateInstances: TemplateInstance[],
    templates: TemplateList,
    editorType: "landing" | "template",
    templateKey?: string
  ): SandpackBundlerFiles {
    const sandpackFiles: SandpackBundlerFiles = {};

    if (editorType === "template" && templateKey) {
      // Режим редактирования шаблона - создаем полноценный HTML
      return this.compileTemplateForPreview(templates[templateKey]);
    }

    // Режим редактирования лендинга - обычная компиляция
    Object.entries(sourceFiles).forEach(([path, file]) => {
      sandpackFiles[path] = { code: file.code };
    });

    // Компилируем HTML файлы с шаблонами
    Object.keys(sourceFiles).forEach((fileName) => {
      if (fileName.endsWith(".html")) {
        const instances = templateInstances.filter(
          (instance) => instance.htmlFile === fileName
        );
        sandpackFiles[fileName] = {
          code: this.compileHTMLFile(
            sourceFiles[fileName].code,
            instances,
            templates
          ),
        };
      }
    });

    return sandpackFiles;
  }

  /**
   * Компилирует шаблон для предварительного просмотра
   * Создает полноценный HTML документ с подключенными CSS и JS файлами
   */
  private static compileTemplateForPreview(
    templateFiles: FileList
  ): SandpackBundlerFiles {
    const templateConfig = this.parseTemplateConfig(templateFiles);
    if (!templateConfig || !templateConfig.files) {
      return {
        "/index.html": {
          code: "<html><body>Invalid template.json - missing files configuration</body></html>",
        },
      };
    }

    const result: SandpackBundlerFiles = {};

    // 1. Добавляем все исходные файлы шаблона
    Object.entries(templateFiles).forEach(([path, file]) => {
      result[path] = { code: file.code };
    });

    // 2. Получаем HTML контент шаблона
    const templateHTML = templateFiles[templateConfig.files.html]?.code || "";

    // 3. Собираем зависимости
    const fontLinks = (templateConfig.dependencies?.fonts || [])
      .map((fontUrl) => `  <link rel="stylesheet" href="${fontUrl}">`)
      .join("\n");

    const libraryLinks = (templateConfig.dependencies?.libraries || [])
      .filter((lib) => lib.url.endsWith(".css"))
      .map((lib) => `  <link rel="stylesheet" href="${lib.url}">`)
      .join("\n");

    const libraryScripts = (templateConfig.dependencies?.libraries || [])
      .filter((lib) => !lib.url.endsWith(".css"))
      .map((lib) => `  <script src="${lib.url}"></script>`)
      .join("\n");

    // 4. Собираем ссылки на CSS файлы шаблона
    const cssLinks = (templateConfig.files.css || [])
      .map((cssFile) => `  <link rel="stylesheet" href="${cssFile}">`)
      .join("\n");

    // 5. Собираем ссылки на JS файлы шаблона
    const jsScripts = (templateConfig.files.js || [])
      .map((jsFile) => `  <script src="${jsFile}"></script>`)
      .join("\n");

    // 6. Создаем полноценный HTML документ с правильными подключениями
    const fullHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateConfig.name || "Template"} - Preview</title>
${fontLinks}
${libraryLinks}
${cssLinks}
</head>
<body>
  <div style="padding: 20px;">
    ${templateHTML}
  </div>
${libraryScripts}
${jsScripts}
</body>
</html>`;

    // 7. Перезаписываем /index.html с правильными подключениями
    result["/index.html"] = { code: fullHTML };

    return result;
  }

  /**
   * Компилирует HTML файл, заменяя шаблонные маркеры на реальный контент
   */
  private static compileHTMLFile(
    html: string,
    instances: TemplateInstance[],
    templates: TemplateList
  ): string {
    // Функция для получения HTML шаблона по templateId
    const getTemplateHTML = (templateId: string): string => {
      const templateFiles = this.findTemplateFiles(templates, templateId);
      if (!templateFiles) return "";

      const templateConfig = this.parseTemplateConfig(templateFiles);
      if (!templateConfig || !templateConfig.files) return "";

      return templateFiles[templateConfig.files.html]?.code || "";
    };

    // Используем TemplateParser для рендеринга
    return TemplateParser.renderTemplatesInHTML(
      html,
      instances,
      getTemplateHTML
    );
  }

  /**
   * Извлекает переменные из HTML шаблона
   */
  static extractVariables(
    html: string
  ): Array<{ name: string; defaultValue: string }> {
    const matches = html.match(/\{(\w+)=([^}]+)\}/g) || [];
    return matches.map((match) => {
      const [, name, defaultValue] = match.match(/\{(\w+)=([^}]+)\}/) || [];
      return { name, defaultValue };
    });
  }

  private static findTemplateFiles(
    templates: TemplateList,
    templateId: string
  ): FileList | null {
    for (const templateFiles of Object.values(templates)) {
      const config = this.parseTemplateConfig(templateFiles);
      if (config?.id === templateId) {
        return templateFiles;
      }
    }
    return null;
  }

  private static parseTemplateConfig(
    templateFiles: FileList
  ): TemplateConfig | null {
    try {
      const configCode = templateFiles["/template.json"]?.code;
      if (!configCode) return null;

      const config = JSON.parse(configCode);

      // Добавляем валидацию структуры
      if (!config.id || !config.files) {
        console.error("Invalid template config:", config);
        return null;
      }

      return config;
    } catch (error) {
      console.error("Failed to parse template config:", error);
      return null;
    }
  }
}
