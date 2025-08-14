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

  // Editor styles
  function addEditableStyles() {
    if (document.getElementById("preview-editor-styles")) return;
    const style = document.createElement("style");
    style.id = "preview-editor-styles";
    style.textContent = `
      [data-inline-editor] {
        all: unset;
        font: inherit;
        line-height: inherit;
        font-weight: inherit;
        color: inherit;
        cursor: text;
      }
      .preview-editable:hover {
        outline: 2px dashed #3b82f6 !important;
        background: rgba(59,130,246,0.05) !important;
        cursor: text !important;
      }
      .preview-editable[contenteditable="true"] {
        outline: 2px dashed #3b82f6 !important;
        background: rgba(59,130,246,0.1) !important;
      }
      .preview-template:hover {
        outline: 2px dashed #f59e42 !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
  }

  // isTempalte
  function isInsideTemplate(element) {
    return !!element.closest("[data-template-id]");
  }

  // isEditableElement
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
      // Используем nth-of-type вместо nth-child
      if (element.parentNode) {
        const siblings = Array.from(element.parentNode.children).filter(
          (sib) => sib.tagName === element.tagName
        );
        if (siblings.length > 1) {
          const idx = siblings.indexOf(element) + 1;
          selector += `:nth-of-type(${idx})`;
        }
      }
      path.unshift(selector);
      element = element.parentElement;
    }

    return "body > " + path.join(" > ");
  }

  function editTextNode(element) {
    let textNode = null;

    if (element && element.nodeType === Node.TEXT_NODE) {
      if (!element.textContent || !element.textContent.trim()) return;
      textNode = element;
    } else if (element && element.nodeType === Node.ELEMENT_NODE) {
      const sel = window.getSelection();
      if (
        sel &&
        sel.anchorNode &&
        sel.anchorNode.nodeType === Node.TEXT_NODE &&
        element.contains(sel.anchorNode) &&
        sel.anchorNode.textContent.replace(/\s+/g, "").length
      ) {
        textNode = sel.anchorNode;
      }
      if (!textNode) {
        textNode = Array.from(element.childNodes).find(
          (n) =>
            n.nodeType === Node.TEXT_NODE &&
            n.textContent &&
            n.textContent.replace(/\s+/g, "").length
        );
      }
    }

    if (!textNode) return;

    const parentEl = textNode.parentNode;
    if (parentEl.nodeType !== Node.ELEMENT_NODE || !isEditableElement(parentEl))
      return;

    const originalText = textNode.textContent;

    const wrapper = document.createElement("span");
    wrapper.setAttribute("contenteditable", "true");
    wrapper.dataset.inlineEditor = "true";
    wrapper.textContent = originalText;

    parentEl.replaceChild(wrapper, textNode);

    const range = document.createRange();
    range.selectNodeContents(wrapper);
    const sel2 = window.getSelection();
    sel2.removeAllRanges();
    sel2.addRange(range);
    wrapper.focus();

    let finished = false;

    function cleanup(replaceWithNode) {
      if (wrapper.parentNode) {
        wrapper.parentNode.replaceChild(replaceWithNode, wrapper);
      }
      wrapper.removeEventListener("blur", onBlur);
      wrapper.removeEventListener("keydown", onKeyDown);
    }

    function postIfChanged(newValueNode) {
      const textNodesNow = Array.from(parentEl.childNodes).filter(
        (n) => n.nodeType === Node.TEXT_NODE
      );
      const textNodeIndex = textNodesNow.indexOf(newValueNode);
      if (textNodeIndex === -1) return;

      const newContent = newValueNode.textContent;
      if (newContent === originalText) return;

      const selector = getElementSelector(parentEl);
      window.parent.postMessage(
        {
          type: "TEXT_UPDATED",
          payload: {
            elementSelector: selector,
            newText: newContent.trimStart(),
            textNodeIndex,
          },
        },
        "*"
      );
    }

    function finish(save) {
      if (finished) return;
      finished = true;
      const replacement = document.createTextNode(
        save ? wrapper.textContent : originalText
      );
      cleanup(replacement);
      if (save) postIfChanged(replacement);
    }

    function onBlur() {
      finish(true);
    }

    function onKeyDown(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        wrapper.removeEventListener("blur", onBlur); // не дать второму finish
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        wrapper.removeEventListener("blur", onBlur);
        finish(false);
      }
    }

    wrapper.addEventListener("blur", onBlur);
    wrapper.addEventListener("keydown", onKeyDown);
  }

  function editTemplate(element) {
    const templateElement = element.closest("[data-template-id]");

    window.parent.postMessage(
      {
        type: "TEMPLATE_EDIT",
        payload: {
          instanceId: templateElement.getAttribute("data-template-id"),
        },
      },
      "*"
    );
  }

  function handleModifierClick(event) {
    const { metaKey, ctrlKey, target } = event;

    if (!(metaKey || ctrlKey)) {
      return;
    }

    event.preventDefault();
    if (isEditableElement(target)) {
      editTextNode(target);
    } else if (target.closest("[data-template-id]")) {
      editTemplate(target);
    }
  }

  function handleMouseOver(event) {
    const element = event.target;

    const isTextElement =
      element &&
      EDITABLE_TAGS.includes(element.tagName) &&
      !isInsideTemplate(element) &&
      !!element.textContent?.trim();
    const isTemplate = isInsideTemplate(element);

    if (isTextElement) {
      return element.classList.add("preview-editable");
    }

    if (isTemplate) {
      const templateElement = element.closest("[data-template-id]");
      return templateElement.classList.add("preview-template");
    }
  }

  function handleMouseOut(event) {
    const element = event.target;
    if (
      element &&
      element.classList.contains("preview-editable") &&
      !element.isContentEditable
    ) {
      element.classList.remove("preview-editable");
    }
  }

  function init() {
    addEditableStyles();
    document.addEventListener("click", handleModifierClick);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    window.parent.postMessage({ type: "READY" }, "*");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
