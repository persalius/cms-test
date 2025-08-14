import type { FileList } from "../types/file";
import type { LandingState } from "../context/landing/types";
import type { HtmlInjectorConfig } from "../types/html-injector";
import parse from "node-html-parser";

export class HtmlInjectorIntegrator {
  // Добавляет injector в лендинг
  static addHtmlInjectorToLanding(
    landingState: LandingState,
    htmlInjector: FileList,
    targetHtmlFile: string = "/index.html"
  ): LandingState {
    const templateConfig = this.parseHtmlInjectorConfig(htmlInjector);

    if (!templateConfig) {
      throw new Error("Invalid injector.json");
    }

    const isAlreadyUsed = this.isTemplateStringAbsent(
      landingState.files[targetHtmlFile]?.code || "",
      templateConfig.templateString
    );

    if (isAlreadyUsed) {
      return landingState;
    }

    const updatedFiles = { ...landingState.files };

    const templateString = this.buildTemplateString(templateConfig);

    const updatedHtml = this.addHtmlInjectionToHtml(
      updatedFiles[targetHtmlFile]?.code || "",
      templateString
    );

    updatedFiles[targetHtmlFile] = {
      code: updatedHtml,
    };

    return {
      ...landingState,
      files: updatedFiles,
    };
  }

  private static parseHtmlInjectorConfig(
    templateFiles: FileList
  ): HtmlInjectorConfig | null {
    try {
      const configCode = templateFiles["/injector.json"]?.code;
      if (!configCode) return null;
      return JSON.parse(configCode);
    } catch {
      return null;
    }
  }

  private static isTemplateStringAbsent(
    html: string,
    templateString: string
  ): boolean {
    const baseCommentMatch = templateString.match(/<!--\s*@\w+/);
    const baseComment = baseCommentMatch ? baseCommentMatch[0] : "";
    return html.includes(baseComment);
  }

  static addHtmlInjectionToHtml(html: string, templateString: string): string {
    const root = parse(html, { lowerCaseTagName: false });
    return templateString + "\n" + root.toString();
  }

  private static buildTemplateString(
    templateConfig: HtmlInjectorConfig
  ): string {
    const { templateString, attributes } = templateConfig;
    if (!attributes || !Object.keys(attributes).length) {
      return templateString;
    }

    // Собираем строку атрибутов
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    // Вставляем атрибуты перед закрывающим -->
    return templateString.replace("-->", `${attrs} -->`);
  }
}
