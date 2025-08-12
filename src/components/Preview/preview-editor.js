(function () {
  const EDITABLE_TAGS = [
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "P",
    "SPAN",
    "A",
    "BUTTON",
    "LI",
    "TD",
    "TH",
    "LABEL",
    "STRONG",
    "EM",
    "B",
    "I",
  ];
  let templateInstances = [];

  function isInsideTemplate(element) {
    const templateElement = element.closest("[data-template-id]");
    if (!templateElement) return false;
    const templateId = templateElement.getAttribute("data-template-id");
    return templateInstances.some((instance) => instance.id === templateId);
  }

  function isEditableElement(element) {
    if (!element || !element.tagName) return false;
    if (!EDITABLE_TAGS.includes(element.tagName)) return false;
    if (isInsideTemplate(element)) return false;
    if (element.closest("script, style")) return false;
    return !!element.textContent?.trim();
  }

  function getElementSelector(element) {
    const path = [];
    while (element && element.nodeType === 1 && element !== document.body) {
      let selector = element.tagName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
        path.unshift(selector);
        break;
      } else if (element.className) {
        const classes = element.className
          .split(" ")
          .filter((c) => !!c && !c.startsWith("preview-"));
        if (classes.length) {
          selector += "." + classes.join(".");
        }
      }
      // nth-child
      if (element.parentNode) {
        const siblings = Array.from(element.parentNode.children).filter(
          (sib) => sib.tagName === element.tagName
        );
        if (siblings.length > 1) {
          const idx = siblings.indexOf(element) + 1;
          selector += `:nth-child(${idx})`;
        }
      }
      path.unshift(selector);
      element = element.parentElement;
    }
    return path.join(" > ");
  }

  function addEditableStyles() {
    if (document.getElementById("preview-editor-styles")) return;
    const style = document.createElement("style");
    style.id = "preview-editor-styles";
    style.textContent = `
      .preview-editable:hover {
        outline: 2px dashed #3b82f6 !important;
        background: rgba(59,130,246,0.05) !important;
        cursor: text !important;
      }
      .preview-editable[contenteditable="true"] {
        outline: 2px solid #3b82f6 !important;
        background: rgba(59,130,246,0.1) !important;
      }
      .preview-template:hover {
        outline: 2px dashed #f59e42 !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
  }

  function highlightEditableElements() {
    document.querySelectorAll(".preview-editable").forEach((el) => {
      el.classList.remove("preview-editable");
    });
    document.querySelectorAll(".preview-template").forEach((el) => {
      el.classList.remove("preview-template");
    });
    document.querySelectorAll("*").forEach((element) => {
      if (isEditableElement(element)) {
        element.classList.add("preview-editable");
      }
    });
    document.querySelectorAll("[data-template-id]").forEach((el) => {
      el.classList.add("preview-template");
    });
  }

  function makeElementEditable(element) {
    if (!isEditableElement(element)) return;
    const originalText = element.textContent;
    element.setAttribute("contenteditable", "true");
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    function finishEditing() {
      const newText = element.textContent || "";
      element.removeAttribute("contenteditable");
      if (newText !== originalText) {
        const selector = getElementSelector(element);
        window.parent.postMessage(
          {
            type: "TEXT_UPDATED",
            payload: {
              elementSelector: selector,
              newText,
            },
          },
          "*"
        );
      }
      element.removeEventListener("blur", finishEditing);
      element.removeEventListener("keydown", handleKeyDown);
    }

    function handleKeyDown(event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        element.blur();
      } else if (event.key === "Escape") {
        element.textContent = originalText;
        element.blur();
      }
    }

    element.addEventListener("blur", finishEditing);
    element.addEventListener("keydown", handleKeyDown);
  }

  function handleDoubleClick(event) {
    const element = event.target;
    if (isEditableElement(element)) {
      event.preventDefault();
      makeElementEditable(element);
    } else if (element.closest("[data-template-id]")) {
      const templateElement = element.closest("[data-template-id]");
      window.parent.postMessage(
        {
          type: "TEMPLATE_EDIT",
          payload: {
            templateId: templateElement.getAttribute("data-template-id"),
          },
        },
        "*"
      );
    }
  }

  window.addEventListener("message", function (event) {
    if (event.data.type === "SET_TEMPLATE_INSTANCES") {
      templateInstances = event.data.payload.instances || [];
      highlightEditableElements();
    }
  });

  function init() {
    addEditableStyles();
    document.addEventListener("dblclick", handleDoubleClick);
    window.parent.postMessage({ type: "READY" }, "*");
    highlightEditableElements();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
