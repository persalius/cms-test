import type { TemplateInstance } from "../types/template";

export class TemplateParser {
  /**
   * Парсит HTML и извлекает все Template компоненты
   */
  static parseTemplatesFromHTML(html: string): Array<{
    instanceId: string;
    templateName: string;
    props: Record<string, string>;
    startIndex: number;
    endIndex: number;
  }> {
    const templates: Array<{
      instanceId: string;
      templateName: string;
      props: Record<string, string>;
      startIndex: number;
      endIndex: number;
    }> = [];

    // Регулярное выражение для поиска Template компонентов
    const templateRegex = /<Template\s+([^>]*?)\/>/g;
    let match;

    while ((match = templateRegex.exec(html)) !== null) {
      const [fullMatch, attributesString] = match;
      const startIndex = match.index;
      const endIndex = match.index + fullMatch.length;

      // Парсим атрибуты
      const attributes = this.parseAttributes(attributesString);

      if (attributes.name && attributes.templateId) {
        // Извлекаем пропсы (все атрибуты кроме name и templateId)
        const { name, templateId, ...props } = attributes;

        templates.push({
          instanceId: templateId,
          templateName: name,
          props,
          startIndex,
          endIndex,
        });
      }
    }

    return templates;
  }

  /**
   * Заменяет Template компоненты на рендеренный HTML
   */
  static renderTemplatesInHTML(
    html: string,
    templateInstances: TemplateInstance[],
    getTemplateHTML: (templateId: string) => string
  ): string {
    const templates = this.parseTemplatesFromHTML(html);
    let renderedHTML = html;

    // Сортируем по убыванию индекса, чтобы заменять с конца
    const sortedTemplates = templates.sort(
      (a, b) => b.startIndex - a.startIndex
    );

    sortedTemplates.forEach((template) => {
      // Находим экземпляр шаблона
      const instance = templateInstances.find(
        (inst) => inst.id === template.instanceId
      );
      if (!instance) return;

      // Получаем HTML шаблона
      const templateHTML = getTemplateHTML(instance.templateId);
      if (!templateHTML) return;

      // Рендерим шаблон с пропсами
      const renderedTemplate = this.renderTemplateWithProps(templateHTML, {
        ...template.props,
        ...instance.props, // пропсы из instance имеют приоритет
      });

      // Добавляем атрибуты к корневому элементу шаблона
      const templateWithAttributes = this.addAttributesToRootElement(
        renderedTemplate,
        template.instanceId,
        instance.templateId
      );

      // Заменяем Template компонент на рендеренный HTML
      renderedHTML =
        renderedHTML.slice(0, template.startIndex) +
        templateWithAttributes +
        renderedHTML.slice(template.endIndex);
    });

    return renderedHTML;
  }

  /**
   * Добавляет атрибуты к корневому элементу HTML
   */
  private static addAttributesToRootElement(
    html: string,
    instanceId: string,
    templateId: string
  ): string {
    // Ищем первый HTML тег
    const tagMatch = html.match(/^(\s*)<(\w+)([^>]*)(\/?>)/);
    if (!tagMatch) return html;

    const [fullMatch, leadingWhitespace, tagName, existingAttributes, tagEnd] =
      tagMatch;

    // Проверяем, есть ли уже data-template-id атрибут
    if (existingAttributes.includes("data-template-id")) {
      return html; // Атрибуты уже добавлены
    }

    // Добавляем наши атрибуты
    const newAttributes = ` data-template-id="${instanceId}" data-template-type="${templateId}"`;

    // Если это самозакрывающийся тег
    if (tagEnd === "/>") {
      const newTag = `${leadingWhitespace}<${tagName}${existingAttributes}${newAttributes} />`;
      return html.replace(fullMatch, newTag);
    } else {
      // Обычный тег
      const newTag = `${leadingWhitespace}<${tagName}${existingAttributes}${newAttributes}>`;
      return html.replace(fullMatch, newTag);
    }
  }

  /**
   * Рендерит шаблон, заменяя переменные на значения из пропсов
   */
  private static renderTemplateWithProps(
    html: string,
    props: Record<string, string>
  ): string {
    return html.replace(
      /\{(\w+)=([^}]+)\}/g,
      (match, varName, defaultValue) => {
        return props[varName] !== undefined ? props[varName] : defaultValue;
      }
    );
  }

  /**
   * Парсит строку атрибутов в объект
   */
  private static parseAttributes(
    attributesString: string
  ): Record<string, string> {
    const attributes: Record<string, string> = {};

    // Регулярное выражение для атрибутов вида key="value"
    const attrRegex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(attributesString)) !== null) {
      const [, key, value] = match;
      attributes[key] = value;
    }

    return attributes;
  }
}
