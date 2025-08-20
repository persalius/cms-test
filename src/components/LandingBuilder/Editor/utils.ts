export const getLanguageFromPath = (filePath: string) => {
  if (filePath.endsWith(".js")) return "javascript";
  if (filePath.endsWith(".ts")) return "typescript";
  if (filePath.endsWith(".jsx")) return "javascript";
  if (filePath.endsWith(".tsx")) return "typescript";
  if (filePath.endsWith(".html")) return "html";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".scss")) return "scss";
  if (filePath.endsWith(".json")) return "json";
  if (filePath.endsWith(".md")) return "markdown";
  return "plaintext";
};
