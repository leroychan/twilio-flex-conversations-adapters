import React from "react";
import * as Flex from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";
import {
  DiscordIcon,
  FacebookMessengerIcon,
  GoogleChatIcon,
  InstagramIcon,
  KakaoTalkIcon,
  LINEIcon,
  MicrosoftTeamsIcon,
  SlackIcon,
  TelegramIcon,
  TikTokIcon,
  TwitterIcon,
  ViberIcon,
  WeChatIcon,
  ZaloIcon,
} from "./components/SocialIcons";

const PLUGIN_NAME = "ConversationsIconsPlugin";

export default class ConversationsIconsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * Flex Conversations Adapters - Show Icons
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    /**
     * Check Channel Source
     * @param {Flex.ITask} task - Flex's Task
     * @param {string} identityPrefix - Identity's prefix
     * @return {boolean} - Whether channel matches
     */
    const checkChannel = (task: Flex.ITask, identityPrefix: string) => {
      if (task?.attributes?.customerAddress?.startsWith(identityPrefix)) {
        return true;
      } else {
        return false;
      }
    };

    // Channel: Discord
    const chatChannelDiscord = Flex.DefaultTaskChannels.createChatTaskChannel(
      "discord",
      (task) => checkChannel(task, "discord")
    );
    chatChannelDiscord.icons = {
      active: <DiscordIcon />,
      list: {
        Assigned: <DiscordIcon />,
        Canceled: <DiscordIcon />,
        Completed: <DiscordIcon />,
        Pending: <DiscordIcon />,
        Reserved: <DiscordIcon />,
        Wrapping: <DiscordIcon />,
      },
      main: <DiscordIcon />,
    };
    Flex.TaskChannels.register(chatChannelDiscord);

    // Channel: Facebook Messenger
    const chatChannelFBM = Flex.DefaultTaskChannels.createChatTaskChannel(
      "messenger",
      (task) => checkChannel(task, "messenger")
    );
    chatChannelFBM.icons = {
      active: <FacebookMessengerIcon />,
      list: {
        Assigned: <FacebookMessengerIcon />,
        Canceled: <FacebookMessengerIcon />,
        Completed: <FacebookMessengerIcon />,
        Pending: <FacebookMessengerIcon />,
        Reserved: <FacebookMessengerIcon />,
        Wrapping: <FacebookMessengerIcon />,
      },
      main: <FacebookMessengerIcon />,
    };
    Flex.TaskChannels.register(chatChannelFBM);

    // Channel: Google Chat
    const chatChannelGoogleChat =
      Flex.DefaultTaskChannels.createChatTaskChannel("gchat", (task) =>
        checkChannel(task, "gchat")
      );
    chatChannelGoogleChat.icons = {
      active: <GoogleChatIcon />,
      list: {
        Assigned: <GoogleChatIcon />,
        Canceled: <GoogleChatIcon />,
        Completed: <GoogleChatIcon />,
        Pending: <GoogleChatIcon />,
        Reserved: <GoogleChatIcon />,
        Wrapping: <GoogleChatIcon />,
      },
      main: <GoogleChatIcon />,
    };
    Flex.TaskChannels.register(chatChannelGoogleChat);

    // Channel: Instagram
    const chatChannelInstagram = Flex.DefaultTaskChannels.createChatTaskChannel(
      "instagram",
      (task) => checkChannel(task, "ig") || checkChannel(task, "instagram")
    );
    chatChannelInstagram.icons = {
      active: <InstagramIcon />,
      list: {
        Assigned: <InstagramIcon />,
        Canceled: <InstagramIcon />,
        Completed: <InstagramIcon />,
        Pending: <InstagramIcon />,
        Reserved: <InstagramIcon />,
        Wrapping: <InstagramIcon />,
      },
      main: <InstagramIcon />,
    };
    Flex.TaskChannels.register(chatChannelInstagram);

    // Channel: KakaoTalk
    const chatChannelKakaoTalk = Flex.DefaultTaskChannels.createChatTaskChannel(
      "kakaotalk",
      (task) => checkChannel(task, "kakaotalk")
    );
    chatChannelKakaoTalk.icons = {
      active: <KakaoTalkIcon />,
      list: {
        Assigned: <KakaoTalkIcon />,
        Canceled: <KakaoTalkIcon />,
        Completed: <KakaoTalkIcon />,
        Pending: <KakaoTalkIcon />,
        Reserved: <KakaoTalkIcon />,
        Wrapping: <KakaoTalkIcon />,
      },
      main: <KakaoTalkIcon />,
    };
    Flex.TaskChannels.register(chatChannelKakaoTalk);

    // Channel: LINE
    const chatChannelLINE = Flex.DefaultTaskChannels.createChatTaskChannel(
      "line",
      (task) => checkChannel(task, "line")
    );
    chatChannelLINE.icons = {
      active: <LINEIcon />,
      list: {
        Assigned: <LINEIcon />,
        Canceled: <LINEIcon />,
        Completed: <LINEIcon />,
        Pending: <LINEIcon />,
        Reserved: <LINEIcon />,
        Wrapping: <LINEIcon />,
      },
      main: <LINEIcon />,
    };
    Flex.TaskChannels.register(chatChannelLINE);

    // Channel: Microsoft Teams
    const chatChannelTeams = Flex.DefaultTaskChannels.createChatTaskChannel(
      "teams",
      (task) => checkChannel(task, "teams")
    );
    chatChannelTeams.icons = {
      active: <MicrosoftTeamsIcon />,
      list: {
        Assigned: <MicrosoftTeamsIcon />,
        Canceled: <MicrosoftTeamsIcon />,
        Completed: <MicrosoftTeamsIcon />,
        Pending: <MicrosoftTeamsIcon />,
        Reserved: <MicrosoftTeamsIcon />,
        Wrapping: <MicrosoftTeamsIcon />,
      },
      main: <MicrosoftTeamsIcon />,
    };
    Flex.TaskChannels.register(chatChannelTeams);

    // Channel: Slack
    const chatChannelSlack = Flex.DefaultTaskChannels.createChatTaskChannel(
      "slack",
      (task) => checkChannel(task, "slack")
    );
    chatChannelSlack.icons = {
      active: <SlackIcon />,
      list: {
        Assigned: <SlackIcon />,
        Canceled: <SlackIcon />,
        Completed: <SlackIcon />,
        Pending: <SlackIcon />,
        Reserved: <SlackIcon />,
        Wrapping: <SlackIcon />,
      },
      main: <SlackIcon />,
    };
    Flex.TaskChannels.register(chatChannelSlack);

    // Channel: Telegram
    const chatChannelTelegram = Flex.DefaultTaskChannels.createChatTaskChannel(
      "telegram",
      (task) => checkChannel(task, "telegram")
    );
    chatChannelTelegram.icons = {
      active: <TelegramIcon />,
      list: {
        Assigned: <TelegramIcon />,
        Canceled: <TelegramIcon />,
        Completed: <TelegramIcon />,
        Pending: <TelegramIcon />,
        Reserved: <TelegramIcon />,
        Wrapping: <TelegramIcon />,
      },
      main: <TelegramIcon />,
    };
    Flex.TaskChannels.register(chatChannelTelegram);

    // Channel: TikTok
    const chatChannelTikTok = Flex.DefaultTaskChannels.createChatTaskChannel(
      "tiktok",
      (task) => checkChannel(task, "tiktok")
    );
    chatChannelTikTok.icons = {
      active: <TikTokIcon />,
      list: {
        Assigned: <TikTokIcon />,
        Canceled: <TikTokIcon />,
        Completed: <TikTokIcon />,
        Pending: <TikTokIcon />,
        Reserved: <TikTokIcon />,
        Wrapping: <TikTokIcon />,
      },
      main: <TikTokIcon />,
    };
    Flex.TaskChannels.register(chatChannelTikTok);

    // Channel: Twitter
    const chatChannelTwitter = Flex.DefaultTaskChannels.createChatTaskChannel(
      "twitter",
      (task) => checkChannel(task, "twitter")
    );
    chatChannelTwitter.icons = {
      active: <TwitterIcon />,
      list: {
        Assigned: <TwitterIcon />,
        Canceled: <TwitterIcon />,
        Completed: <TwitterIcon />,
        Pending: <TwitterIcon />,
        Reserved: <TwitterIcon />,
        Wrapping: <TwitterIcon />,
      },
      main: <TwitterIcon />,
    };
    Flex.TaskChannels.register(chatChannelTwitter);

    // Channel: Viber
    const chatChannelViber = Flex.DefaultTaskChannels.createChatTaskChannel(
      "viber",
      (task) => checkChannel(task, "viber")
    );
    chatChannelViber.icons = {
      active: <ViberIcon />,
      list: {
        Assigned: <ViberIcon />,
        Canceled: <ViberIcon />,
        Completed: <ViberIcon />,
        Pending: <ViberIcon />,
        Reserved: <ViberIcon />,
        Wrapping: <ViberIcon />,
      },
      main: <ViberIcon />,
    };
    Flex.TaskChannels.register(chatChannelViber);

    // Channel: WeChat
    const chatChannelWeChat = Flex.DefaultTaskChannels.createChatTaskChannel(
      "wechat",
      (task) => checkChannel(task, "wechat")
    );
    chatChannelWeChat.icons = {
      active: <WeChatIcon />,
      list: {
        Assigned: <WeChatIcon />,
        Canceled: <WeChatIcon />,
        Completed: <WeChatIcon />,
        Pending: <WeChatIcon />,
        Reserved: <WeChatIcon />,
        Wrapping: <WeChatIcon />,
      },
      main: <WeChatIcon />,
    };
    Flex.TaskChannels.register(chatChannelWeChat);

    // Channel: Zalo
    const chatChannelZalo = Flex.DefaultTaskChannels.createChatTaskChannel(
      "zalo",
      (task) => checkChannel(task, "zalo")
    );
    chatChannelZalo.icons = {
      active: <ZaloIcon />,
      list: {
        Assigned: <ZaloIcon />,
        Canceled: <ZaloIcon />,
        Completed: <ZaloIcon />,
        Pending: <ZaloIcon />,
        Reserved: <ZaloIcon />,
        Wrapping: <ZaloIcon />,
      },
      main: <ZaloIcon />,
    };
    Flex.TaskChannels.register(chatChannelZalo);
  }
}
