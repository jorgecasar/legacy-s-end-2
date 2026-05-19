import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    headless: true,
    trace: "retain-on-failure",
    screenshot: "on",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "component",
      use: {
        baseURL: "http://localhost:6006",
      },
      testMatch: /.*\.component\.spec\.ts/,
    },
    {
      name: "integration",
      use: {
        baseURL: "http://localhost:3000",
      },
      testMatch: /(routing|example|ai-settings|diagnostics)\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: "npm run start",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "npm run storybook -- --ci",
      port: 6006,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
