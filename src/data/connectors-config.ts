/**
 * Connectors Configuration
 * 
 * This module exports the connectors configuration as a TypeScript object
 * to avoid JSON import issues across different module resolution modes.
 */

export const connectorsConfig = {
  requiredToolkits: [
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
    "reddit",
    "x",
    "googledrive",
    "googledocs",
    "hubspot",
    "mailchimp"
  ],
  roleToolkits: [
    {
      roleKey: "growth-editorial-strategy-lead",
      toolkits: [
        "googledrive",
        "googledocs"
      ]
    },
    {
      roleKey: "growth-channel-operations-lead",
      toolkits: [
        "facebook",
        "instagram",
        "youtube",
        "tiktok",
        "reddit",
        "x"
      ]
    },
    {
      roleKey: "growth-community-engagement-specialist",
      toolkits: [
        "facebook",
        "instagram",
        "youtube",
        "tiktok",
        "reddit",
        "x"
      ]
    },
    {
      roleKey: "growth-social-analytics-specialist",
      toolkits: [
        "hubspot",
        "mailchimp"
      ]
    },
    {
      roleKey: "growth-instagram-publisher-specialist",
      toolkits: [
        "instagram"
      ]
    },
    {
      roleKey: "growth-facebook-publisher-specialist",
      toolkits: [
        "facebook"
      ]
    },
    {
      roleKey: "growth-x-publisher-specialist",
      toolkits: [
        "x"
      ]
    },
    {
      roleKey: "growth-youtube-publisher-specialist",
      toolkits: [
        "youtube"
      ]
    },
    {
      roleKey: "growth-tiktok-publisher-specialist",
      toolkits: [
        "tiktok"
      ]
    },
    {
      roleKey: "growth-reddit-publisher-specialist",
      toolkits: [
        "reddit"
      ]
    }
  ]
} as const;

export type ConnectorsConfig = typeof connectorsConfig;
