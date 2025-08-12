import { iFrameMessage } from "../constants/iframe-message";

export interface TextUpdateMessage {
  type: typeof iFrameMessage.TEXT_UPDATED;
  payload: {
    elementSelector: string;
    newText: string;
    htmlFile: string;
  };
}

export interface TemplateEditMessage {
  type: typeof iFrameMessage.TEMPLATE_EDIT;
  payload: {
    templateId: string;
  };
}

export interface ReadyMessage {
  type: typeof iFrameMessage.READY;
}
