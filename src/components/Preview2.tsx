import React, { useEffect, useRef } from "react";
import { DEVICES } from "../shared/constants/device";

export const Preview2 = ({ files, activeHtml = "/index.html", device }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const cleanupUrls = [];

    const updateIframeContent = () => {
      try {
        const fileUrls = Object.entries(files).reduce((acc, [path, file]) => {
          const type = path.endsWith(".css")
            ? "text/css"
            : path.endsWith(".js")
            ? "application/javascript"
            : "text/html";
          const blob = new Blob([file.content], { type });
          const url = URL.createObjectURL(blob);
          acc[path] = url;
          cleanupUrls.push(url);
          return acc;
        }, {});

        const htmlContent = files[activeHtml]?.content;
        if (!htmlContent) {
          console.error("Initial HTML file not found!");
          return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          const href = link.getAttribute("href");
          if (href && fileUrls[href]) {
            link.setAttribute("href", fileUrls[href]);
          }
        });

        doc.querySelectorAll("script[src]").forEach((script) => {
          const src = script.getAttribute("src");
          if (src && fileUrls[src]) {
            script.setAttribute("src", fileUrls[src]);
          }
        });

        const finalHtml = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
        const finalHtmlBlob = new Blob([finalHtml], { type: "text/html" });
        const finalHtmlUrl = URL.createObjectURL(finalHtmlBlob);
        cleanupUrls.push(finalHtmlUrl);

        iframe.src = finalHtmlUrl;
      } catch (error) {
        console.error("Failed to create HTML preview:", error);
      }
    };

    updateIframeContent();

    return () => {
      cleanupUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files, activeHtml]);

  return (
    <div
      style={{
        width: "50%",
        padding: 12,
        display: "flex",
        justifyContent: "center",
        background: "rgb(248, 250, 252)",
      }}
    >
      <div
        style={{
          width: DEVICES[device].width,
          padding: DEVICES[device].px,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <iframe
          ref={iframeRef}
          title="HTML Preview"
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: "100%",
            height: "600px",
            border: "none",
          }}
        />
      </div>
    </div>
  );
};
