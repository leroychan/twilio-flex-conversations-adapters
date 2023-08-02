---
title: Create Task Channel
position: 3
---

# Create Task Channel

<p align="center">
    <img src="../img/getting-started/task-channel-create-task-channel.png" alt="Task Channel Overall" />
</p>

## Overview

- The main purpose of the TaskRouter - Task Channel is to uniquely identify the different inbound channels and report within Flex Insights accordingly (using `Communication Channels` attribute)
- It is recommended to create 1 Task Channel per custom channel.

## Instructions

1. Login to [Twilio Console](https://console.twilio.com/) and under `TaskRouter`, select `Workspaces` and then `Flex Task Assignment`
1. On the left-hand side menu bar, select `Task Channels`
1. Click on the `Create new Task Channel` button
1. Input the custom channel's name and click `Create`
   - It is recommended for the Task Channel's name to be in all lowercase with no spaces

:::info

You do NOT need to take note of the Task Channel's SID. When creating a new Studio Flow with the `Send to Flex` widget, you are able to select via a dropdown list your desired Task Channel

![Task Channel - Studio](/img/getting-started/task-channel-studio.png)

:::
