export type LINEContext = {
  LINE_STUDIO_FLOW_SID: string;
  LINE_CHANNEL_ID: string;
  LINE_CHANNEL_SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  DOMAIN_NAME_OVERRIDE: string;
};

export enum LINEMessageType {
  TEXT = "text",
  FILE = "file",
  CONTACT = "contact",
  LOCATION = "location",
  STICKER = "sticker",
  IMAGE = "image",
  VIDEO = "video",
  URL = "url",
}
