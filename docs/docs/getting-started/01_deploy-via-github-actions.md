---
title: Deploy via GitHub Actions (Recommended)
---

# Deploy via GitHub Actions (Recommended)

<p align="center">
    <img src="../img/getting-started/github-actions-overall.png" alt="Github Actions Overall" />
</p>

## Overview

GitHub Actions streamlines the deployment process to multiple Twilio Flex instances through a comprehensive release pipeline. It facilitates enhanced management of environment variables using the Environment feature of GitHub, allowing the use of multiple environments to ensure consistency of deployment across different Twilio Flex instances through utilizing the same code base.

## Pre-Requisites

- Twilio Flex Account ([Guide](https://support.twilio.com/hc/en-us/articles/360020442333-Setup-a-Twilio-Flex-Account))
- GitHub Account ([Guide](https://docs.github.com/en/get-started/signing-up-for-github/signing-up-for-a-new-github-account))
- Required values for each respective custom channels ([Guide](../channels/overview))

## Instructions

1. [Fork this GitHub repository](https://github.com/leroychan/twilio-flex-conversations-adapters/fork) into your own GitHub account
1. Set the forked GitHub repository to be a **public repository** as GitHub Actions is only [free for public repositories](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions).
1. Navigate to your [Twilio Console](https://console.twilio.com/) to create your Twilio API Key and API Secret ([Guide](https://www.twilio.com/docs/glossary/what-is-an-api-key#how-can-i-create-api-keys)).
   - You will need to obtain the following before proceeding:
     - `TWILIO_ACCOUNT_SID`: Twilio Account SID that you are deploying to (starting with `ACxxxxxxxxx`)
     - `TWILIO_API_KEY`: Twilio API Key (starting with `SKxxxxxxxxx`)
     - `TWILIO_API_SECRET`: Twilio API Secret
1. For each custom channel that you would like to enable, it is recommended that you create 1 Studio per custom channel ([Guide](./create-studio-flow)).
   - You will need to have the Studio Flow SID (starting with `FWxxxxxxxxx`) of each custom channel that you would like to enable.
   - For channels that you **do not** want to enable, you **do not** need to create the Studio Flow.
1. For each custom channel that you would like to enable, perform the necessary setup and obtain the required values. The required variables per custom channel can be found in the [Channels Overview page](../channels/overview).
1. Within GitHub Console, navigate to the repository that you have forked, click on `Settings > Environment > New Environment` and add the following **secrets** with the value you have obtained from the previous steps:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_API_KEY`
   - `TWILIO_API_SECRET`
   - **Required variables per custom channel that you want to enable**
     - **Example**: To enable only LINE, you would need the following variables with their respective values:
       - `TWILIO_ACCOUNT_SID`
       - `TWILIO_API_KEY`
       - `TWILIO_API_SECRET`
       - `LINE_STUDIO_FLOW_SID`
       - `LINE_CHANNEL_ID`
       - `LINE_CHANNEL_SECRET`
       - `LINE_CHANNEL_ACCESS_TOKEN`
     - **Example**: To enable both LINE and Viber, you would need the following variables with their respective values:
       - `TWILIO_ACCOUNT_SID`
       - `TWILIO_API_KEY`
       - `TWILIO_API_SECRET`
       - `LINE_STUDIO_FLOW_SID`
       - `LINE_CHANNEL_ID`
       - `LINE_CHANNEL_SECRET`
       - `LINE_CHANNEL_ACCESS_TOKEN`
       - `VIBER_STUDIO_FLOW_SID`
       - `VIBER_AUTH_TOKEN`
1. Within GitHub Console, navigate to the repository that you have forked, click on `Actions > Deploy to Flex > Run workflow`. Select the environment that you have created previously and click `Run workflow`
   - If you are deploying for the first time, tick the box that says `Deploy UI Icons Plugin?`. You will only need to do this once per Flex Account SID.
1. The workflow will run to build, compile and process all the required components and deploy it to your chosen environment (i.e. Flex Account). You can also click on each of the workflow runs to view the logs.
1. Within [Twilio Console](https://console.twilio.com/), on the left hand side menu bar, navigate to `Functions and Assets > Services`. Look for `twilio-flex-conversations-adapters` and click on `Service Details`. Under `Environments > Domain`, take note of the domain URL.
   - The domain URL should be in the format of `twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io`.
1. We will need the respective custom channels `incoming` webhook URL that is in the format of `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/<CHANNEL>/incoming`
   - **Example**:
     - `LINE`: `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/line/incoming`
     - `Viber`: `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/viber/incoming`
1. Configure each custom channel's webhook setting in their respective consoles with the `incoming` webhook URL in the previous step. Refer to the respective documentation page under `Channels` for exact instructions.
1. You have now completed the setup. Proceed to test the integration by logging into your Flex Agent console and put yourself as `Available`. Send a test message to your custom channnel and it should appear in your Flex Agent console.
