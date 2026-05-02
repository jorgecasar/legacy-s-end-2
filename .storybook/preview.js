import "@awesome.me/webawesome/dist/styles/themes/awesome.css";
import { html } from "lit";

/** @type { import('@storybook/web-components-vite').Preview } */
const preview = {
  decorators: [
    (story) => {
      // Apply theme classes to html element for Web Awesome compatibility
      document.documentElement.classList.add("wa-theme-awesome", "wa-dark", "wa-palette-bright");
      
      return html`
      <div style="
        min-height: 100vh;
        background-color: var(--wa-color-surface-default);
        color: var(--wa-color-text-normal);
        padding: var(--wa-spacing-medium);
        margin: -1rem; /* Offset storybook default padding */
      ">
        ${story()}
      </div>
    `;
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
