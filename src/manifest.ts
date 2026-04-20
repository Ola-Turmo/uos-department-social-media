import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const manifest: PaperclipPluginManifestV1 = {
  id: "uos.department-social-media",
  apiVersion: 1,
  version: "0.1.0",
  displayName: "Department Social Media",
  description: "Department overlay for social media and content roles, jobs, skills, and connector policy.",
  author: "turmo.dev",
  categories: ["automation"],
  capabilities: [
    "events.subscribe",
    "plugin.state.read",
    "plugin.state.write",
    "ui.dashboardWidget.register",
    "ui.page.register"
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui"
  },
  ui: {
    slots: [
      {
        type: "dashboardWidget",
        id: "health-widget",
        displayName: "Department Social Media Health",
        exportName: "DashboardWidget"
      },
      {
        type: "page",
        id: "social-command-center-page",
        displayName: "Social Media Command Center",
        exportName: "SocialMediaCommandCenterPage",
        routePath: "social-command-center"
      }
    ]
  }
};

export default manifest;
