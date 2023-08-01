import { chat_v1 } from "googleapis";

export type GoogleChatContext = {
  GOOGLECHAT_STUDIO_FLOW_SID: string;
  GOOGLECHAT_SERVICE_ACCOUNT_FILENAME: string;
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  DOMAIN_NAME_OVERRIDE: string;
};

export enum GoogleChatMessageType {
  TEXT = "text",
  AUDIO = "audio",
  IMAGE = "image",
  VIDEO = "video",
}

type TwilioInjectedRequest = {
  request: any;
};

// Schema$DeprecatedEvent is the only suitable type from googleapis
export type GoogleChatBaseMessage = chat_v1.Schema$DeprecatedEvent &
  TwilioInjectedRequest;
