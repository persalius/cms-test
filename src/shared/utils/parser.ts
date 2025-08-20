import parse, { HTMLElement } from "node-html-parser";

export const parseHtml = (html: string): HTMLElement => {
  return parse(html, {
    lowerCaseTagName: false,
    comment: true,
    voidTag: {
      closingSlash: true,
    },
  });
};
