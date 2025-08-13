export const transfomTemplateString = (value: string) => {
  return value.replace(/<Template([^>]*)><\/Template>/g, "<Template$1 />");
};
