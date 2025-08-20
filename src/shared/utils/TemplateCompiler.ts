import type { FileList } from "../types/file";
import type {
  TemplateInstance,
  Injection,
  TemplateLibraryItem,
} from "../types/template";
import type { TemplateList } from "../types/template";
import type { SandpackBundlerFiles } from "@codesandbox/sandpack-client";
import { TemplateParser } from "./templateParser";
import {
  getUniqueUsedTemplates,
  getFilePathInBrowser,
  getLinkInBrowser,
  getTemplateHtmlFile,
  parseTemplateConfig,
} from "./template";

interface CompileForSandpack {
  files: FileList;
  activeHtml: string;
  templateInstances: TemplateInstance[];
  templates: TemplateList;
  editorType: "landing" | "template";
}

interface CompileLandingForPreview {
  files: FileList;
  templateInstances: TemplateInstance[];
  activeHtml: string;
  templates: TemplateList;
}

export class TemplateCompiler {
  static compileForSandpack({
    files,
    activeHtml,
    templateInstances,
    templates,
    editorType,
  }: CompileForSandpack): SandpackBundlerFiles | null {
    if (editorType === "template") {
      return files;
    }

    if (editorType === "landing") {
      return this.compileLandingForPreview({
        files,
        templateInstances,
        activeHtml,
        templates,
      });
    }

    return null;
  }

  // Compiles the Landing for preview
  private static compileLandingForPreview({
    files,
    templateInstances,
    activeHtml,
    templates,
  }: CompileLandingForPreview) {
    const sandpackFiles: SandpackBundlerFiles = { ...files };

    const templatesInPage = templateInstances.filter(
      (instance) => instance.htmlFile === activeHtml
    );

    const uniqueTemplatesInPage = getUniqueUsedTemplates(
      templatesInPage,
      templates
    );

    let html = files[activeHtml].code;
    html = this.applyInjectionsToHtml({ html, uniqueTemplatesInPage });
    html = this.injectDependencies(html, uniqueTemplatesInPage);
    html = this.compileHTMLFile(html, templatesInPage, templates);

    sandpackFiles[activeHtml] = {
      code: html,
    };

    return sandpackFiles;
  }

  private static injectDependencies(
    html: string,
    uniqueTemplatesInPage: FileList[]
  ): string {
    let updatedHTML = html;

    // Собираем все теги шрифтов из всех шаблонов
    const allFontTags = new Set<string>();
    // Собираем все ссылки на библиотеки (скрипты, стили)
    const allLibraries = new Map<string, TemplateLibraryItem[]>();

    uniqueTemplatesInPage.forEach((template) => {
      const templateConfig = parseTemplateConfig(template);
      const fonts = templateConfig?.dependencies?.fonts || [];
      const libraries = templateConfig?.dependencies?.libraries || {};

      fonts.forEach((fontObj) => {
        allFontTags.add(fontObj.tag.trim());
      });

      Object.keys(libraries).forEach((libName) => {
        allLibraries.set(libName, libraries[libName]);
      });
    });

    // Вставляем все уникальные шрифты перед первым <link rel="stylesheet">
    Array.from(allFontTags).forEach((fontTag) => {
      updatedHTML = this.insertLinkBeforeFirstStylesheet(updatedHTML, fontTag);
    });

    // Вставляем все скрипты и стили
    Array.from(allLibraries.values())
      .flat()
      .forEach((lib) => {
        updatedHTML = this.insertTagInDom({
          html: updatedHTML,
          injection: { target: lib.target, container: lib.container },
          linkTag: lib.tag,
        });
      });

    return updatedHTML;
  }

  // Собирает все injections из используемых шаблонов
  private static collectAllInjections(
    uniqueTemplatesInPage: FileList[]
  ): Record<string, Record<string, Injection>> {
    const injections: Record<string, Record<string, Injection>> = {};
    uniqueTemplatesInPage.forEach((template) => {
      const config = parseTemplateConfig(template);
      if (!config?.injections) return;

      Object.entries(config.injections).forEach(([filePath, injection]) => {
        const filePathInBrowser = getFilePathInBrowser(filePath);
        if (!filePathInBrowser) return;
        injections[config.id] = {
          ...injections[config.id],
          [filePathInBrowser]: injection,
        };
      });
    });

    return injections;
  }

  // Вставляет CSS/JS файлы в HTML по правилам injections
  private static applyInjectionsToHtml({
    html,
    uniqueTemplatesInPage,
  }: {
    html: string;
    uniqueTemplatesInPage: FileList[];
  }): string {
    let updatedHtml = html;
    const allInjections = this.collectAllInjections(uniqueTemplatesInPage);

    Object.values(allInjections).forEach((injections) => {
      Object.entries(injections).forEach(([filePath, injection]) => {
        const linkTag = getLinkInBrowser(filePath);
        if (!linkTag) return;

        updatedHtml = this.insertTagInDom({
          html: updatedHtml,
          injection,
          linkTag,
        });
      });
    });

    return updatedHtml;
  }

  private static insertTagInDom({
    html,
    injection,
    linkTag,
  }: {
    html: string;
    injection: Injection;
    linkTag: string;
  }): string {
    const { target, container } = injection;
    let updatedHtml = html;

    if (target.startsWith("comment:")) {
      const commentName = target.replace("comment:", "");
      if (updatedHtml.includes(commentName)) {
        updatedHtml = this.replaceCommentWithLink({
          html: updatedHtml,
          commentName,
          linkTag,
        });
      }
    } else if (target === "start") {
      updatedHtml = this.insertLinkAfterTag(
        updatedHtml,
        `<${container}>`,
        linkTag
      );
    } else if (target === "end") {
      updatedHtml = this.insertLinkBeforeTag({
        html: updatedHtml,
        container: `</${container}>`,
        linkTag,
      });
    } else if (target === "before-styles") {
      updatedHtml = this.insertLinkBeforeFirstStylesheet(updatedHtml, linkTag);
    } else if (target === "before-scripts") {
      updatedHtml = this.insertLinkBeforeFirstScript({
        html: updatedHtml,
        linkTag,
        container,
      });
    } else {
      updatedHtml = this.insertLinkBeforeTag({
        html: updatedHtml,
        container: `</${container}>`,
        linkTag,
      });
    }

    return updatedHtml;
  }

  // Вставляет link сразу после указанного открывающего тега
  private static insertLinkAfterTag(
    html: string,
    tag: string,
    linkTag: string
  ): string {
    const tagIndex = html.indexOf(tag);
    if (tagIndex === -1) return html;
    const insertIndex = tagIndex + tag.length;
    return (
      html.slice(0, insertIndex) +
      "\n  " +
      linkTag +
      "\n" +
      html.slice(insertIndex)
    );
  }

  // Вставляет link прямо перед указанным закрывающим тегом
  private static insertLinkBeforeTag({
    html,
    linkTag,
    container,
  }: {
    html: string;
    linkTag: string;
    container: string;
  }): string {
    const tagIndex = html.indexOf(container);
    if (tagIndex === -1) return html;
    return (
      html.slice(0, tagIndex) + "  " + linkTag + "\n" + html.slice(tagIndex)
    );
  }

  // Заменяет комментарий на ссылку
  private static replaceCommentWithLink({
    html,
    commentName,
    linkTag,
  }: {
    html: string;
    commentName: string;
    linkTag: string;
  }): string {
    const commentTag = `<!-- ${commentName} -->`;
    const regex = new RegExp(`${commentTag}\\s*`, "g");

    return html.replace(regex, `${linkTag}` + "\n");
  }

  // Вставляет link перед первым <link rel="stylesheet">
  private static insertLinkBeforeFirstStylesheet(
    html: string,
    linkTag: string
  ): string {
    const regex = /<link[^>]*rel=["']stylesheet["'][^>]*>/i;
    const match = regex.exec(html);
    if (match) {
      const insertIndex = match.index;
      return (
        html.slice(0, insertIndex) +
        "  " +
        linkTag +
        "\n" +
        html.slice(insertIndex)
      );
    }

    return this.insertLinkBeforeTag({ html, container: "</head>", linkTag });
  }

  // Вставляет link перед первым <script>
  private static insertLinkBeforeFirstScript({
    html,
    linkTag,
    container,
  }: {
    html: string;
    linkTag: string;
    container: Injection["container"];
  }): string {
    const openTag = `<${container}>`;
    const closeTag = `</${container}>`;
    const openIndex = html.indexOf(openTag);
    const closeIndex = html.indexOf(closeTag);

    if (openIndex === -1 || closeIndex === -1) {
      // Если контейнер не найден, fallback — вставить перед закрывающим тегом
      return this.insertLinkBeforeTag({ html, container: closeTag, linkTag });
    }

    // Получаем содержимое контейнера
    const containerContent = html.slice(openIndex + openTag.length, closeIndex);
    const scriptRegex = /<script[^>]*>/i;
    const match = scriptRegex.exec(containerContent);

    if (match) {
      // Вставляем перед первым <script> внутри контейнера
      const relativeInsertIndex = match.index;
      const absoluteInsertIndex =
        openIndex + openTag.length + relativeInsertIndex;
      return (
        html.slice(0, absoluteInsertIndex) +
        "  " +
        linkTag +
        "\n" +
        html.slice(absoluteInsertIndex)
      );
    }

    return this.insertLinkBeforeTag({ html, container: closeTag, linkTag });
  }

  // Compiles the template for preview
  // private static compileTemplateForPreview(
  //   templateFiles: FileList
  // ): SandpackBundlerFiles {
  //   const previewIndexHtml = templateFiles["/index.html"];
  //   return templateFiles;

  //   const templateConfig = parseTemplateConfig(templateFiles);

  //   if (!templateConfig) {
  //     return {
  //       "/index.html": {
  //         code: "<html><body>Invalid config.json - missing files configuration</body></html>",
  //       },
  //     };
  //   }

  //   const result: SandpackBundlerFiles = {};

  //   Object.entries(templateFiles).forEach(([path, file]) => {
  //     if (path.startsWith("/src/")) {
  //       result[path] = { code: file.code };
  //     }
  //   });

  //   // Получаем HTML контент шаблона из папки src
  //   const templateHTML = getTemplateHtmlFile(templateFiles);

  //   // Собираем зависимости
  //   const fonts = (templateConfig.dependencies?.fonts || []) as TemplateFont[];
  //   const libraries = (templateConfig.dependencies?.libraries ||
  //     []) as TemplateLibraries;

  //   const libraryStyles: string[] = [];
  //   const libraryScripts: string[] = [];

  //   Object.values(libraries)
  //     .flat()
  //     .map(({ tag }) => {
  //       if (tag.includes("link")) {
  //         libraryStyles.push(tag);
  //       }
  //       if (tag.includes("script")) {
  //         libraryScripts.push(tag);
  //       }
  //     });

  //   const libraryStylesString = libraryStyles.join("\n");
  //   const libraryScriptsString = libraryScripts.join("\n");
  //   const fontsString = fonts.map(({ tag }) => tag).join("\n");

  //   const cssFiles = getTemplateCssFiles(templateFiles);
  //   console.log("cssFiles", cssFiles);

  //   const cssLinks = Object.keys(cssFiles)
  //     .map((filePath) => `  <link rel="stylesheet" href="${filePath}">`)
  //     .join("\n");

  //   // Собираем ссылки на CSS файлы шаблона
  //   // const cssLinks = getTemplateCssFiles(templateFiles)
  //   //   .map((cssFile) => `  <link rel="stylesheet" href="${cssFile}">`)
  //   //   .join("\n");

  //   // 5. Собираем ссылки на JS файлы шаблона
  //   const jsScripts = getTemplateJsFiles(templateFiles)
  //     .map((jsFile) => `  <script src="${jsFile}"></script>`)
  //     .join("\n");

  //   // 6. Создаем полноценный HTML документ с правильными подключениями
  //   const fullHTML = `<!DOCTYPE html>
  //       <html lang="ru">
  //       <head>
  //         <meta charset="UTF-8">
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //         <title>${templateConfig.name || "Template"} - Preview</title>
  //       ${fontsString}
  //       ${libraryStylesString}
  //       ${cssLinks}
  //       </head>
  //       <body>
  //         ${templateHTML}
  //         ${libraryScriptsString}
  //         ${jsScripts}
  //       </body>
  //       </html>`;

  //   // 7. Перезаписываем /index.html с правильными подключениями
  //   result["/index.html"] = { code: fullHTML };

  //   return result;
  // }

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
      const templateHTML = getTemplateHtmlFile(templateFiles);
      if (!templateHTML) return "";
      return templateHTML;
    };

    // Используем TemplateParser для рендеринга
    return TemplateParser.renderTemplatesInHTML(
      html,
      instances,
      getTemplateHTML
    );
  }

  private static findTemplateFiles(
    templates: TemplateList,
    templateId: string
  ): FileList | null {
    for (const templateFiles of Object.values(templates)) {
      const config = parseTemplateConfig(templateFiles);
      if (config?.id === templateId) {
        return templateFiles;
      }
    }
    return null;
  }
}
