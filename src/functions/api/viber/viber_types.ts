export type ViberContext = {
  VIBER_STUDIO_FLOW_SID: string;
  VIBER_AUTH_TOKEN: string;
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  DOMAIN_NAME_OVERRIDE: string;
};

export type ViberMessage = ViberBaseMessage;

export enum ViberMessageType {
  TEXT = "text",
  FILE = "file",
  CONTACT = "contact",
  LOCATION = "location",
  STICKER = "sticker",
  PICTURE = "picture",
  VIDEO = "video",
  URL = "url",
}
export type ViberBaseMessage = {
  request: any;
  receiver: string;
  min_api_version: number;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  tracking_data: string;
  message:
    | ViberMessageText
    | ViberMessagePicture
    | ViberMessageVideo
    | ViberMessageFile
    | ViberMessageContact
    | ViberMessageLocation
    | ViberMessageUrl
    | ViberMessageSticker;
};

export type ViberMessageText = {
  type: ViberMessageType.TEXT;
  text: string;
};

export type ViberMessagePicture = {
  type: ViberMessageType.PICTURE;
  media: string;
  thumbnail: string;
  file_name: string;
};

export type ViberMessageVideo = {
  type: ViberMessageType.VIDEO;
  media: string;
  thumbnail: string;
  size: number;
  duration: number;
  file_name: string;
};

export type ViberMessageFile = {
  type: ViberMessageType.FILE;
  media: string;
  thumbnail: string;
  size: number;
  file_name: string;
};

export type ViberMessageContact = {
  type: ViberMessageType.CONTACT;
  contact: {
    name: string;
    phone_number: string;
  };
};

export type ViberMessageLocation = {
  type: ViberMessageType.LOCATION;
  location: {
    lat: string;
    lon: string;
  };
};

export type ViberMessageUrl = {
  type: ViberMessageType.URL;
  media: string;
};

export type ViberMessageSticker = {
  type: ViberMessageType.STICKER;
  sticker_id: string;
};
