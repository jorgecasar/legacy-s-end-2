import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:6006",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "on",
    video: "on-first-retry",
  },
  webServer: {
    command: "npm run storybook -- --ci",
    port: 6006,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
