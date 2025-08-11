import type { FileList } from "../types/file";
import type { LandingState } from "../types/landng";
import type { TemplateInstance, TemplateConfig } from "../types/template";

export class TemplateIntegrator {
  /**
   * Добавляет шаблон в лендинг
   */
  static addTemplateToLanding(
    landingState: LandingState,
    templateFiles: FileList,
    props: Record<string, string> = {},
    targetHtmlFile: string = "/index.html"
  ): LandingState {
    const templateConfig = this.parseTemplateConfig(templateFiles);
    if (!templateConfig) {
      throw new Error("Invalid template.json");
    }

    // Создаем уникальный ID для экземпляра шаблона
    const instanceId = `${templateConfig.id}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const updatedFiles = { ...landingState.files };
    const newTemplateFilesAdded = new Set(landingState.templateFilesAdded);

    // 1. Добавляем CSS файлы (только если еще не добавлены для этого шаблона)
    templateConfig.files.css.forEach((cssFile, index) => {
      const cssContent = templateFiles[cssFile]?.code;
      if (cssContent) {
        const cssFileName =
          templateConfig.files.css.length === 1
            ? `/css/${templateConfig.id}.css`
            : `/css/${templateConfig.id}-${index + 1}.css`;

        // Добавляем файл только если его еще нет
        if (!newTemplateFilesAdded.has(cssFileName)) {
          updatedFiles[cssFileName] = {
            code: cssContent,
          };
          newTemplateFilesAdded.add(cssFileName);
        }
      }
    });

    // 2. Добавляем JS файлы (только если еще не добавлены для этого шаблона)
    templateConfig.files.js.forEach((jsFile, index) => {
      const jsContent = templateFiles[jsFile]?.code;
      if (jsContent) {
        const jsFileName =
          templateConfig.files.js.length === 1
            ? `/scripts/${templateConfig.id}.js`
            : `/scripts/${templateConfig.id}-${index + 1}.js`;

        // Добавляем файл только если его еще нет
        if (!newTemplateFilesAdded.has(jsFileName)) {
          updatedFiles[jsFileName] = {
            code: jsContent,
          };
          newTemplateFilesAdded.add(jsFileName);
        }
      }
    });

    // 3. Обновляем HTML: добавляем подключения и React-компонент
    const dependenciesKey = `dependencies-${templateConfig.id}`;
    const needsUpdate = !newTemplateFilesAdded.has(dependenciesKey);

    updatedFiles[targetHtmlFile] = {
      code: this.updateHTMLWithTemplate(
        updatedFiles[targetHtmlFile]?.code || "",
        templateConfig,
        props,
        instanceId,
        needsUpdate
      ),
    };

    if (needsUpdate) {
      newTemplateFilesAdded.add(dependenciesKey);
    }

    // 4. Создаем экземпляр шаблона для отслеживания
    const templateInstance: TemplateInstance = {
      id: instanceId,
      templateId: templateConfig.id,
      props,
      htmlFile: targetHtmlFile,
    };

    return {
      files: updatedFiles,
      templateInstances: [...landingState.templateInstances, templateInstance],
      templateFilesAdded: newTemplateFilesAdded,
    };
  }

  /**
   * Обновляет пропсы существующего шаблона
   */
  static updateTemplateProps(
    landingState: LandingState,
    instanceId: string,
    newProps: Record<string, string>
  ): LandingState {
    return {
      ...landingState,
      templateInstances: landingState.templateInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, props: { ...instance.props, ...newProps } }
          : instance
      ),
    };
  }

  /**
   * Определяет, является ли элемент частью шаблона
   */
  static getTemplateInstanceFromElement(
    element: Element,
    templateInstances: TemplateInstance[]
  ): TemplateInstance | null {
    const templateElement = element.closest("[data-template-id]");
    if (!templateElement) return null;

    const instanceId = templateElement.getAttribute("data-template-id");
    return (
      templateInstances.find((instance) => instance.id === instanceId) || null
    );
  }

  // Приватные методы
  private static updateHTMLWithTemplate(
    html: string,
    templateConfig: TemplateConfig,
    props: Record<string, string>,
    instanceId: string,
    needsDependencies: boolean
  ): string {
    let updatedHTML = html;

    // 1. Добавляем зависимости ПЕРЕД основными стилями (делаем это первым)
    if (needsDependencies && templateConfig.dependencies) {
      updatedHTML = this.injectDependencies(
        updatedHTML,
        templateConfig.dependencies
      );
    }

    // 2. Добавляем CSS файлы шаблона ПЕРЕД основными стилями страницы
    if (templateConfig.files.css.length) {
      templateConfig.files.css.forEach((_, index) => {
        const cssFileName =
          templateConfig.files.css.length === 1
            ? `/css/${templateConfig.id}.css`
            : `/css/${templateConfig.id}-${index + 1}.css`;

        const cssLink = `<link rel="stylesheet" href="${cssFileName}">`;

        // Проверяем, что ссылка еще не добавлена
        if (!updatedHTML.includes(cssLink)) {
          updatedHTML = this.insertBeforeFirstStylesheet(updatedHTML, cssLink);
        }
      });
    }

    // 3. Добавляем JS файлы шаблона в конец body
    if (templateConfig.files.js.length > 0) {
      templateConfig.files.js.forEach((_, index) => {
        const jsFileName =
          templateConfig.files.js.length === 1
            ? `/scripts/${templateConfig.id}.js`
            : `/scripts/${templateConfig.id}-${index + 1}.js`;

        const jsScript = `<script src="${jsFileName}"></script>`;

        // Проверяем, что скрипт еще не добавлен
        if (!updatedHTML.includes(jsScript)) {
          updatedHTML = this.insertBeforeBodyClose(updatedHTML, jsScript);
        }
      });
    }

    // 4. Добавляем React-компонент
    const templateComponent = this.createTemplateComponent(
      templateConfig,
      props,
      instanceId
    );

    // Вставляем перед первым скриптом или перед </body>
    updatedHTML = this.insertTemplateComponent(updatedHTML, templateComponent);

    return updatedHTML;
  }

  private static insertBeforeFirstStylesheet(
    html: string,
    cssLink: string
  ): string {
    // Ищем первую ссылку на стили с отступами
    const firstStyleMatch = html.match(/(\s*)<link[^>]*rel="stylesheet"[^>]*>/);

    if (firstStyleMatch) {
      const [fullMatch, indentation] = firstStyleMatch;
      const insertIndex = html.indexOf(fullMatch);
      return (
        html.slice(0, insertIndex) +
        `${indentation}${cssLink}` +
        html.slice(insertIndex)
      );
    } else {
      // Если стилей нет, ищем отступ по другим элементам в head
      const headContentMatch = html.match(/<head[^>]*>[\s\S]*?(\s+)<[^>]+>/);

      if (headContentMatch) {
        const [, indentation] = headContentMatch;
        const headCloseIndex = html.indexOf("</head>");
        return (
          html.slice(0, headCloseIndex) +
          `${indentation}${cssLink}` +
          html.slice(headCloseIndex)
        );
      } else {
        // Fallback: базовый отступ
        const headCloseIndex = html.indexOf("</head>");
        if (headCloseIndex !== -1) {
          return (
            html.slice(0, headCloseIndex) +
            `    ${cssLink}` +
            html.slice(headCloseIndex)
          );
        }
      }
    }
    return html;
  }

  private static insertBeforeBodyClose(html: string, script: string): string {
    // Ищем последний скрипт перед </body> с отступами
    const lastScriptMatch = html.match(
      /(\s*)<script[^>]*>[^<]*<\/script>(?=[\s\S]*<\/body>)(?![\s\S]*<script)/
    );

    if (lastScriptMatch) {
      // Если есть скрипты, добавляем после последнего с тем же отступом
      const [fullMatch, indentation] = lastScriptMatch;
      const insertIndex = html.indexOf(fullMatch) + fullMatch.length;
      return (
        html.slice(0, insertIndex) +
        `${indentation}${script}` +
        html.slice(insertIndex)
      );
    } else {
      // Если скриптов нет, ищем отступ по другим элементам в body
      const bodyContentMatch = html.match(/<body[^>]*>[\s\S]*?(\s+)<[^>]+>/);

      if (bodyContentMatch) {
        // Используем отступ существующих элементов в body
        const [, indentation] = bodyContentMatch;
        const bodyCloseIndex = html.lastIndexOf("</body>");
        return (
          html.slice(0, bodyCloseIndex) +
          `${indentation}${script}` +
          html.slice(bodyCloseIndex)
        );
      } else {
        // Fallback: базовый отступ если нет других элементов
        const bodyCloseIndex = html.lastIndexOf("</body>");
        if (bodyCloseIndex !== -1) {
          return (
            html.slice(0, bodyCloseIndex) +
            `  ${script}` +
            html.slice(bodyCloseIndex)
          );
        }
      }
    }

    return html;
  }

  private static insertTemplateComponent(
    html: string,
    templateComponent: string
  ): string {
    // Ищем первый скрипт ТОЛЬКО в body
    const bodyStartIndex = html.indexOf("<body");
    const bodyCloseIndex = html.lastIndexOf("</body>");

    if (bodyStartIndex === -1 || bodyCloseIndex === -1) {
      return html; // Некорректный HTML
    }

    // Ищем скрипты только в пределах body
    const bodyContent = html.slice(bodyStartIndex, bodyCloseIndex);
    const firstScriptMatch = bodyContent.match(/(\s*)<script[^>]*>/);

    if (firstScriptMatch) {
      const [fullMatch, indentation] = firstScriptMatch;
      const firstScriptIndex = bodyStartIndex + bodyContent.indexOf(fullMatch);

      // Вставляем перед первым скриптом в body с тем же отступом
      return (
        html.slice(0, firstScriptIndex) +
        `${indentation}${templateComponent}` +
        html.slice(firstScriptIndex)
      );
    }

    // Если скриптов в body нет, ищем отступ по другим элементам в body
    const bodyContentMatch = html.match(/<body[^>]*>[\s\S]*?(\s+)<[^>]+>/);

    if (bodyContentMatch) {
      const [, indentation] = bodyContentMatch;
      return (
        html.slice(0, bodyCloseIndex) +
        `${indentation}${templateComponent}` +
        html.slice(bodyCloseIndex)
      );
    } else {
      // Fallback: базовый отступ
      return (
        html.slice(0, bodyCloseIndex) +
        `    ${templateComponent}` +
        html.slice(bodyCloseIndex)
      );
    }
  }

  private static injectDependencies(
    html: string,
    dependencies: TemplateConfig["dependencies"]
  ): string {
    let updatedHTML = html;

    // Проверяем, что dependencies существует
    if (!dependencies) {
      return updatedHTML;
    }

    // Добавляем шрифты в head ПЕРЕД основными стилями
    if (Array.isArray(dependencies.fonts) && dependencies.fonts.length > 0) {
      dependencies.fonts.forEach((fontUrl) => {
        if (typeof fontUrl === "string" && fontUrl.trim()) {
          const fontLink = `<link rel="stylesheet" href="${fontUrl}">`;
          if (!updatedHTML.includes(fontLink)) {
            updatedHTML = this.insertBeforeFirstStylesheet(
              updatedHTML,
              fontLink
            );
          }
        }
      });
    }

    // Добавляем библиотеки
    if (
      Array.isArray(dependencies.libraries) &&
      dependencies.libraries.length
    ) {
      dependencies.libraries.forEach(({ url, location }) => {
        if (!!url && url.trim()) {
          if (url.endsWith(".css")) {
            // CSS библиотеки в head ПЕРЕД основными стилями
            const cssTag = `<link rel="stylesheet" href="${url}">`;
            if (!updatedHTML.includes(cssTag)) {
              updatedHTML = this.insertBeforeFirstStylesheet(
                updatedHTML,
                cssTag
              );
            }
          } else if (url.endsWith(".js")) {
            // JS библиотеки в конец body
            const jsTag = `<script src="${url}"></script>`;
            if (!updatedHTML.includes(jsTag)) {
              // updatedHTML = this.insertBeforeBodyClose(updatedHTML, jsTag);
              switch (location) {
                case "head-end":
                  updatedHTML = this.insertBeforeHeadClose(updatedHTML, jsTag);
                  break;
                case "body-start":
                  updatedHTML = this.insertAfterBodyOpen(updatedHTML, jsTag);
                  break;
                case "body-end":
                default:
                  updatedHTML = this.insertBeforeBodyClose(updatedHTML, jsTag);
                  break;
              }
            }
          }
        }
      });
    }

    return updatedHTML;
  }

  private static insertBeforeHeadClose(html: string, element: string): string {
    // Ищем существующие элементы в head для определения отступа
    const headContentMatch = html.match(/<head[^>]*>[\s\S]*?(\s+)<[^>]+>/);

    if (headContentMatch) {
      const [, indentation] = headContentMatch;
      const headCloseIndex = html.indexOf("</head>");
      if (headCloseIndex !== -1) {
        return (
          html.slice(0, headCloseIndex) +
          `${indentation}${element}` +
          html.slice(headCloseIndex)
        );
      }
    } else {
      // Базовый отступ если нет других элементов
      const headCloseIndex = html.indexOf("</head>");
      if (headCloseIndex !== -1) {
        return (
          html.slice(0, headCloseIndex) +
          `    ${element}` +
          html.slice(headCloseIndex)
        );
      }
    }
    return html;
  }

  private static insertAfterBodyOpen(html: string, element: string): string {
    // Ищем существующие элементы в body для определения отступа
    const bodyContentMatch = html.match(/<body[^>]*>[\s\S]*?(\s+)<[^>]+>/);

    if (bodyContentMatch) {
      const [, indentation] = bodyContentMatch;
      const bodyOpenMatch = html.match(/<body[^>]*>/);
      if (bodyOpenMatch) {
        const insertIndex =
          html.indexOf(bodyOpenMatch[0]) + bodyOpenMatch[0].length;
        return (
          html.slice(0, insertIndex) +
          `${indentation}${element}` +
          html.slice(insertIndex)
        );
      }
    } else {
      // Базовый отступ если нет других элементов
      const bodyOpenMatch = html.match(/<body[^>]*>/);
      if (bodyOpenMatch) {
        const insertIndex =
          html.indexOf(bodyOpenMatch[0]) + bodyOpenMatch[0].length;
        return (
          html.slice(0, insertIndex) + `${element}` + html.slice(insertIndex)
        );
      }
    }
    return html;
  }

  private static createTemplateComponent(
    templateConfig: TemplateConfig,
    props: Record<string, string>,
    instanceId: string
  ): string {
    // Создаем атрибуты из пропсов
    const propsString = Object.entries(props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    // В Editor используем templateId (читаемо), но в Preview будет data-template-id
    const templateIdAttr = `templateId="${instanceId}"`;

    // Создаем React-подобный компонент
    const allProps = propsString
      ? `${propsString} ${templateIdAttr}`
      : templateIdAttr;

    return `<Template name="${templateConfig.id}" ${allProps} />`;
  }

  private static parseTemplateConfig(
    templateFiles: FileList
  ): TemplateConfig | null {
    try {
      const configCode = templateFiles["/template.json"]?.code;
      if (!configCode) return null;
      return JSON.parse(configCode);
    } catch {
      return null;
    }
  }
}
