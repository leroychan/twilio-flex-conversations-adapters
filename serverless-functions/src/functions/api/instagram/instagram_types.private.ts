export type InstagramContext = {
  INSTAGRAM_STUDIO_FLOW_SID: string;
  INSTAGRAM_APP_SECRET: string;
  INSTAGRAM_PAGE_ACCESS_TOKEN: string;
  INSTAGRAM_WEBHOOK_VERIFY_TOKEN: string;
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  DOMAIN_NAME_OVERRIDE: string;
};

export enum InstagramMessageType {
  TEXT = "text",
  AUDIO = "audio",
  IMAGE = "image",
  VIDEO = "video",
}

export type InstagramBaseMessage = {
  "hub.mode"?: string;
  "hub.challenge"?: string;
  "hub.verify_token"?: string;
  request: any;
  object: string;
  entry: Array<InstagramEntry>;
};

export type InstagramEntry = {
  time: number;
  id: string;
  messaging: Array<InstagramMessaging>;
};

export type InstagramMessaging = {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  message: InstagramMessageText | InstagramMessageMedia;
};

export type InstagramMessageText = {
  mid: string;
  text: string;
  is_echo?: boolean;
};

export type InstagramMessageMedia = {
  mid: string;
  attachments: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
  is_echo?: boolean;
};

export type InstagramSendMessagePayload = {
  recipient: {
    id: string;
  };
  message: {
    text: string;
  };
};

export type InstagramSendMediaPayload = {
  recipient: {
    id: string;
  };
  message: {
    attachment: {
      type: string;
      payload: {
        url: string;
      };
    };
  };
};
