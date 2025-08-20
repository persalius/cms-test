import { v4 as uuidv4 } from "uuid";
import type { FileList } from "../types/file";
import type { TemplateInstance, TemplateConfig } from "../types/template";
import { parseTemplateConfig, transfomTemplateString } from "./template";
import { getTemplateFromHtml } from "./template";
import type { LandingState } from "../context/landing/types";
import { parseHtml } from "./parser";

export class TemplateIntegrator {
  // Добавляет шаблон в лендинг
  static addTemplateToLanding(
    landingState: LandingState,
    templateFiles: FileList,
    targetHtmlFile: string = "/index.html"
  ): LandingState {
    const templateConfig = parseTemplateConfig(templateFiles);
    if (!templateConfig) {
      throw new Error("Invalid config.json");
    }

    const instanceId = uuidv4();

    const updatedFiles = { ...landingState.files };

    const templateComponent = this.createTemplateComponent(
      templateConfig,
      instanceId
    );

    let html = updatedFiles[targetHtmlFile]?.code || "";
    html = this.insertTemplateComponent(html, templateComponent);
    if (templateConfig.injections) {
      html = this.insertInjectionsByComment(html, templateConfig.injections);
    }

    updatedFiles[targetHtmlFile] = {
      code: html,
    };

    const templateInstance: TemplateInstance = {
      id: instanceId,
      templateId: templateConfig.id,
      htmlFile: targetHtmlFile,
    };

    return {
      files: updatedFiles,
      templateInstances: [...landingState.templateInstances, templateInstance],
    };
  }

  // Вставляем комментарии из config.injections в DOM
  private static insertInjectionsByComment(
    html: string,
    injections: Record<string, { target: string; container: string }>
  ): string {
    let newHtml = html;
    const root = parseHtml(newHtml);
    Object.keys(injections).forEach((filePath) => {
      const { target, container } = injections[filePath];

      if (target.startsWith("comment:")) {
        const commentName = target.replace("comment:", "");
        const containerElement = root.querySelector(container);

        const hasComment = containerElement?.childNodes.some(
          (node) => node.nodeType === 8 && node.rawText.trim() === commentName
        );

        if (!hasComment && containerElement) {
          newHtml = newHtml.replace(
            `</${container}>`,
            `  <!-- ${commentName} -->\n  </${container}>`
          );
        }
      }
    });

    return newHtml;
  }

  // Обновляет атрибуты существующего шаблона
  static updateTemplateAttributions(
    landingState: LandingState,
    instanceId: string,
    attributions: Record<string, string>
  ): LandingState {
    if (!attributions || !Object.keys(attributions).length) return landingState;

    const instance = landingState.templateInstances.find(
      (i) => i.id === instanceId
    );
    if (!instance) return landingState;

    const filePath = instance.htmlFile;
    const fileEntry = landingState.files[filePath];
    if (!fileEntry) return landingState;

    const original = fileEntry.code;
    const root = parseHtml(original);

    // Ищем <Template templateId="instanceId" ... />
    const template = getTemplateFromHtml({ html: root, instanceId });
    if (!template) return landingState;

    // Обновляем / добавляем атрибуты
    Object.entries(attributions).forEach(([key, value]) => {
      if (!value) {
        template.removeAttribute(key);
      } else {
        template.setAttribute(key, String(value));
      }
    });

    // Рендер
    const updatedHtml = transfomTemplateString(root.toString());

    return {
      ...landingState,
      files: {
        ...landingState.files,
        [filePath]: { code: updatedHtml },
      },
    };
  }

  private static insertTemplateComponent(
    html: string,
    templateComponent: string
  ): string {
    const root = parseHtml(html);
    const body = root.querySelector("body");
    if (!body) return html;

    let indentation = "  ";
    const firstTextNode = body.childNodes.find(
      (node) => node.nodeType === 3 && /^\s+$/.test(node.rawText)
    );
    if (firstTextNode) {
      indentation = firstTextNode.rawText;
    }

    body.insertAdjacentHTML("afterbegin", `${indentation}${templateComponent}`);
    return transfomTemplateString(root.toString());
  }

  private static createTemplateComponent(
    templateConfig: TemplateConfig,
    instanceId: string
  ): string {
    // In the Editor we use templateId (readable), but in the Preview it will be data-template-id
    const templateIdAttr = `templateId="${instanceId}"`;
    return `<Template name="${templateConfig.id}" ${templateIdAttr} />`;
  }
}

// export class TemplateIntegrator {
//   // Добавляет шаблон в лендинг
//   static addTemplateToLanding(
//     landingState: LandingState,
//     templateFiles: FileList,
//     targetHtmlFile: string = "/index.html"
//   ): LandingState {
//     const templateConfig = this.parseTemplateConfig(templateFiles);
//     if (!templateConfig) {
//       throw new Error("Invalid config.json");
//     }

//     // Создаем уникальный ID для экземпляра шаблона
//     const instanceId = uuidv4();

//     const updatedFiles = { ...landingState.files };
//     // const newTemplateFilesAdded = new Set(landingState.templateFilesAdded);

//     // 1. Добавляем CSS файлы (только если еще не добавлены для этого шаблона)
//     // const templateCss = getTemplateCssFiles(templateFiles);

//     // templateCss.forEach((cssFile, index) => {
//     //   const cssContent = templateFiles[cssFile]?.code;
//     //   if (cssContent) {
//     //     const cssFileName =
//     //       templateCss.length === 1
//     //         ? `/css/${templateConfig.id}.css`
//     //         : `/css/${templateConfig.id}-${index + 1}.css`;

//     //     // Добавляем файл только если его еще нет
//     //     if (!newTemplateFilesAdded.has(cssFileName)) {
//     //       updatedFiles[cssFileName] = {
//     //         code: cssContent,
//     //       };
//     //       newTemplateFilesAdded.add(cssFileName);
//     //     }
//     //   }
//     // });

//     // 2. Добавляем JS файлы (только если еще не добавлены для этого шаблона)
//     // const templateJs = getTemplateJsFiles(templateFiles);
//     // templateJs.forEach((jsFile, index) => {
//     //   const jsContent = templateFiles[jsFile]?.code;
//     //   if (jsContent) {
//     //     const jsFileName =
//     //       templateJs.length === 1
//     //         ? `/scripts/${templateConfig.id}.js`
//     //         : `/scripts/${templateConfig.id}-${index + 1}.js`;

//     //     // Добавляем файл только если его еще нет
//     //     if (!newTemplateFilesAdded.has(jsFileName)) {
//     //       updatedFiles[jsFileName] = {
//     //         code: jsContent,
//     //       };
//     //       newTemplateFilesAdded.add(jsFileName);
//     //     }
//     //   }
//     // });

//     // 3. Обновляем HTML: добавляем подключения и React-компонент
//     // const dependenciesKey = `dependencies-${templateConfig.id}`;
//     // const needsUpdate = !newTemplateFilesAdded.has(dependenciesKey);

//     const templateComponent = this.createTemplateComponent(
//       templateConfig,
//       instanceId
//     );

//     let html = updatedFiles[targetHtmlFile]?.code || "";
//     html = this.insertTemplateComponent(html, templateComponent);

//     updatedFiles[targetHtmlFile] = {
//       code: html,
//     };

//     // if (needsUpdate) {
//     //   newTemplateFilesAdded.add(dependenciesKey);
//     // }

//     // 4. Создаем экземпляр шаблона для отслеживания
//     const templateInstance: TemplateInstance = {
//       id: instanceId,
//       templateId: templateConfig.id,
//       htmlFile: targetHtmlFile,
//       templateConfig,
//     };

//     return {
//       files: updatedFiles,
//       templateInstances: [...landingState.templateInstances, templateInstance],
//       // templateFilesAdded: newTemplateFilesAdded,
//     };
//   }

//   // Обновляет атрибуты существующего шаблона
//   static updateTemplateAttributions(
//     landingState: LandingState,
//     instanceId: string,
//     attributions: Record<string, string>
//   ): LandingState {
//     if (!attributions || !Object.keys(attributions).length) return landingState;

//     const instance = landingState.templateInstances.find(
//       (i) => i.id === instanceId
//     );
//     if (!instance) return landingState;

//     const filePath = instance.htmlFile;
//     const fileEntry = landingState.files[filePath];
//     if (!fileEntry) return landingState;

//     const original = fileEntry.code;
//     const root = parseHtml(original);

//     // Ищем <Template templateId="instanceId" ... />
//     const template = getTemplateFromHtml({ html: root, instanceId });
//     if (!template) return landingState;

//     // Обновляем / добавляем атрибуты
//     Object.entries(attributions).forEach(([key, value]) => {
//       if (!value) {
//         template.removeAttribute(key);
//       } else {
//         template.setAttribute(key, String(value));
//       }
//     });

//     // Рендер
//     const updatedHtml = transfomTemplateString(root.toString());

//     return {
//       ...landingState,
//       files: {
//         ...landingState.files,
//         [filePath]: { code: updatedHtml },
//       },
//     };
//   }

//   /**
//    * Определяет, является ли элемент частью шаблона
//    */
//   static getTemplateInstanceFromElement(
//     element: Element,
//     templateInstances: TemplateInstance[]
//   ): TemplateInstance | null {
//     const templateElement = element.closest("[data-template-id]");
//     if (!templateElement) return null;

//     const instanceId = templateElement.getAttribute("data-template-id");
//     return (
//       templateInstances.find((instance) => instance.id === instanceId) || null
//     );
//   }

//   // Приватные методы
//   // private static updateHTMLWithTemplate(
//   //   html: string,
//   //   templateConfig: TemplateConfig,
//   //   instanceId: string
//   //   // needsDependencies: boolean,
//   //   // templateFiles: FileList
//   // ): string {
//   //   let updatedHTML = html;

//   // 1. Добавляем зависимости ПЕРЕД основными стилями (делаем это первым)
//   // if (needsDependencies && templateConfig.dependencies) {
//   //   updatedHTML = this.injectDependencies(
//   //     updatedHTML,
//   //     templateConfig.dependencies
//   //   );
//   // }

//   // 2. Добавляем CSS файлы шаблона ПЕРЕД основными стилями страницы
//   // const templateCss = getTemplateCssFiles(templateFiles);
//   // if (templateCss.length) {
//   //   templateCss.forEach((_, index) => {
//   //     const cssFileName =
//   //       templateCss.length === 1
//   //         ? `/css/${templateConfig.id}.css`
//   //         : `/css/${templateConfig.id}-${index + 1}.css`;

//   //     const cssLink = `<link rel="stylesheet" href="${cssFileName}">`;

//   //     // Проверяем, что ссылка еще не добавлена
//   //     if (!updatedHTML.includes(cssLink)) {
//   //       updatedHTML = this.insertBeforeFirstStylesheet(updatedHTML, cssLink);
//   //     }
//   //   });
//   // }

//   // 3. Добавляем JS файлы шаблона в конец body
//   // const templateJs = getTemplateJsFiles(templateFiles);
//   // if (templateJs.length > 0) {
//   //   templateJs.forEach((_, index) => {
//   //     const jsFileName =
//   //       templateJs.length === 1
//   //         ? `/scripts/${templateConfig.id}.js`
//   //         : `/scripts/${templateConfig.id}-${index + 1}.js`;

//   //     const jsScript = `<script src="${jsFileName}"></script>`;

//   //     // Проверяем, что скрипт еще не добавлен
//   //     if (!updatedHTML.includes(jsScript)) {
//   //       updatedHTML = this.insertBeforeBodyClose(updatedHTML, jsScript);
//   //     }
//   //   });
//   // }

//   // 4. Добавляем React-компонент
//   // const templateComponent = this.createTemplateComponent(
//   //   templateConfig,
//   //   instanceId
//   // );

//   // // Вставляем перед первым скриптом или перед </body>
//   // updatedHTML = this.insertTemplateComponent(updatedHTML, templateComponent);

//   // return updatedHTML;
//   // }

//   private static insertBeforeFirstStylesheet(
//     html: string,
//     cssLink: string
//   ): string {
//     // Ищем первую ссылку на стили с отступами
//     const firstStyleMatch = html.match(/(\s*)<link[^>]*rel="stylesheet"[^>]*>/);

//     if (firstStyleMatch) {
//       const [fullMatch, indentation] = firstStyleMatch;
//       const insertIndex = html.indexOf(fullMatch);
//       return (
//         html.slice(0, insertIndex) +
//         `${indentation}${cssLink}` +
//         html.slice(insertIndex)
//       );
//     } else {
//       // Если стилей нет, ищем отступ по другим элементам в head
//       const headContentMatch = html.match(/<head[^>]*>[\s\S]*?(\s+)<[^>]+>/);

//       if (headContentMatch) {
//         const [, indentation] = headContentMatch;
//         const headCloseIndex = html.indexOf("</head>");
//         return (
//           html.slice(0, headCloseIndex) +
//           `${indentation}${cssLink}` +
//           html.slice(headCloseIndex)
//         );
//       } else {
//         // Fallback: базовый отступ
//         const headCloseIndex = html.indexOf("</head>");
//         if (headCloseIndex !== -1) {
//           return (
//             html.slice(0, headCloseIndex) +
//             `    ${cssLink}` +
//             html.slice(headCloseIndex)
//           );
//         }
//       }
//     }
//     return html;
//   }

//   private static insertBeforeBodyClose(html: string, script: string): string {
//     // Ищем последний скрипт перед </body> с отступами
//     const lastScriptMatch = html.match(
//       /(\s*)<script[^>]*>[^<]*<\/script>(?=[\s\S]*<\/body>)(?![\s\S]*<script)/
//     );

//     if (lastScriptMatch) {
//       // Если есть скрипты, добавляем после последнего с тем же отступом
//       const [fullMatch, indentation] = lastScriptMatch;
//       const insertIndex = html.indexOf(fullMatch) + fullMatch.length;
//       return (
//         html.slice(0, insertIndex) +
//         `${indentation}${script}` +
//         html.slice(insertIndex)
//       );
//     } else {
//       // Если скриптов нет, ищем отступ по другим элементам в body
//       const bodyContentMatch = html.match(/<body[^>]*>[\s\S]*?(\s+)<[^>]+>/);

//       if (bodyContentMatch) {
//         // Используем отступ существующих элементов в body
//         const [, indentation] = bodyContentMatch;
//         const bodyCloseIndex = html.lastIndexOf("</body>");
//         return (
//           html.slice(0, bodyCloseIndex) +
//           `${indentation}${script}` +
//           html.slice(bodyCloseIndex)
//         );
//       } else {
//         // Fallback: базовый отступ если нет других элементов
//         const bodyCloseIndex = html.lastIndexOf("</body>");
//         if (bodyCloseIndex !== -1) {
//           return (
//             html.slice(0, bodyCloseIndex) +
//             `  ${script}` +
//             html.slice(bodyCloseIndex)
//           );
//         }
//       }
//     }

//     return html;
//   }

//   private static insertTemplateComponent(
//     html: string,
//     templateComponent: string
//   ): string {
//     // Ищем первый скрипт ТОЛЬКО в body
//     const bodyStartIndex = html.indexOf("<body");
//     const bodyCloseIndex = html.lastIndexOf("</body>");

//     if (bodyStartIndex === -1 || bodyCloseIndex === -1) {
//       return html; // Некорректный HTML
//     }

//     // Ищем скрипты только в пределах body
//     const bodyContent = html.slice(bodyStartIndex, bodyCloseIndex);
//     const firstScriptMatch = bodyContent.match(/(\s*)<script[^>]*>/);

//     if (firstScriptMatch) {
//       const [fullMatch, indentation] = firstScriptMatch;
//       const firstScriptIndex = bodyStartIndex + bodyContent.indexOf(fullMatch);

//       // Вставляем перед первым скриптом в body с тем же отступом
//       return (
//         html.slice(0, firstScriptIndex) +
//         `${indentation}${templateComponent}` +
//         html.slice(firstScriptIndex)
//       );
//     }

//     // Если скриптов в body нет, ищем отступ по другим элементам в body
//     const bodyContentMatch = html.match(/<body[^>]*>[\s\S]*?(\s+)<[^>]+>/);

//     if (bodyContentMatch) {
//       const [, indentation] = bodyContentMatch;
//       return (
//         html.slice(0, bodyCloseIndex) +
//         `${indentation}${templateComponent}` +
//         html.slice(bodyCloseIndex)
//       );
//     } else {
//       // Fallback: базовый отступ
//       return (
//         html.slice(0, bodyCloseIndex) +
//         `    ${templateComponent}` +
//         html.slice(bodyCloseIndex)
//       );
//     }
//   }

//   private static injectDependencies(
//     html: string,
//     dependencies: TemplateConfig["dependencies"]
//   ): string {
//     let updatedHTML = html;

//     // Проверяем, что dependencies существует
//     if (!dependencies) {
//       return updatedHTML;
//     }

//     // Добавляем шрифты в head ПЕРЕД основными стилями
//     if (Array.isArray(dependencies.fonts) && dependencies.fonts.length > 0) {
//       dependencies.fonts.forEach((fontUrl) => {
//         if (typeof fontUrl === "string" && fontUrl.trim()) {
//           const fontLink = `<link rel="stylesheet" href="${fontUrl}">`;
//           if (!updatedHTML.includes(fontLink)) {
//             updatedHTML = this.insertBeforeFirstStylesheet(
//               updatedHTML,
//               fontLink
//             );
//           }
//         }
//       });
//     }

//     // Добавляем библиотеки
//     if (
//       Array.isArray(dependencies.libraries) &&
//       dependencies.libraries.length
//     ) {
//       dependencies.libraries.forEach(({ url, location }) => {
//         if (!!url && url.trim()) {
//           if (url.endsWith(".css")) {
//             // CSS библиотеки в head ПЕРЕД основными стилями
//             const cssTag = `<link rel="stylesheet" href="${url}">`;
//             if (!updatedHTML.includes(cssTag)) {
//               updatedHTML = this.insertBeforeFirstStylesheet(
//                 updatedHTML,
//                 cssTag
//               );
//             }
//           } else if (url.endsWith(".js")) {
//             // JS библиотеки в конец body
//             const jsTag = `<script src="${url}"></script>`;
//             if (!updatedHTML.includes(jsTag)) {
//               // updatedHTML = this.insertBeforeBodyClose(updatedHTML, jsTag);
//               switch (location) {
//                 case "head-end":
//                   updatedHTML = this.insertBeforeHeadClose(updatedHTML, jsTag);
//                   break;
//                 case "body-start":
//                   updatedHTML = this.insertAfterBodyOpen(updatedHTML, jsTag);
//                   break;
//                 case "body-end":
//                 default:
//                   updatedHTML = this.insertBeforeBodyClose(updatedHTML, jsTag);
//                   break;
//               }
//             }
//           }
//         }
//       });
//     }

//     return updatedHTML;
//   }

//   private static insertBeforeHeadClose(html: string, element: string): string {
//     // Ищем существующие элементы в head для определения отступа
//     const headContentMatch = html.match(/<head[^>]*>[\s\S]*?(\s+)<[^>]+>/);

//     if (headContentMatch) {
//       const [, indentation] = headContentMatch;
//       const headCloseIndex = html.indexOf("</head>");
//       if (headCloseIndex !== -1) {
//         return (
//           html.slice(0, headCloseIndex) +
//           `${indentation}${element}` +
//           html.slice(headCloseIndex)
//         );
//       }
//     } else {
//       // Базовый отступ если нет других элементов
//       const headCloseIndex = html.indexOf("</head>");
//       if (headCloseIndex !== -1) {
//         return (
//           html.slice(0, headCloseIndex) +
//           `    ${element}` +
//           html.slice(headCloseIndex)
//         );
//       }
//     }
//     return html;
//   }

//   private static insertAfterBodyOpen(html: string, element: string): string {
//     // Ищем существующие элементы в body для определения отступа
//     const bodyContentMatch = html.match(/<body[^>]*>[\s\S]*?(\s+)<[^>]+>/);

//     if (bodyContentMatch) {
//       const [, indentation] = bodyContentMatch;
//       const bodyOpenMatch = html.match(/<body[^>]*>/);
//       if (bodyOpenMatch) {
//         const insertIndex =
//           html.indexOf(bodyOpenMatch[0]) + bodyOpenMatch[0].length;
//         return (
//           html.slice(0, insertIndex) +
//           `${indentation}${element}` +
//           html.slice(insertIndex)
//         );
//       }
//     } else {
//       // Базовый отступ если нет других элементов
//       const bodyOpenMatch = html.match(/<body[^>]*>/);
//       if (bodyOpenMatch) {
//         const insertIndex =
//           html.indexOf(bodyOpenMatch[0]) + bodyOpenMatch[0].length;
//         return (
//           html.slice(0, insertIndex) + `${element}` + html.slice(insertIndex)
//         );
//       }
//     }
//     return html;
//   }

//   private static createTemplateComponent(
//     templateConfig: TemplateConfig,
//     instanceId: string
//   ): string {
//     // В Editor используем templateId (читаемо), но в Preview будет data-template-id
//     const templateIdAttr = `templateId="${instanceId}"`;
//     return `<Template name="${templateConfig.id}" ${templateIdAttr} />`;
//   }

//   private static parseTemplateConfig(
//     templateFiles: FileList
//   ): TemplateConfig | null {
//     try {
//       const configCode = templateFiles["/config.json"]?.code;
//       if (!configCode) return null;
//       return JSON.parse(configCode);
//     } catch {
//       return null;
//     }
//   }
// }
