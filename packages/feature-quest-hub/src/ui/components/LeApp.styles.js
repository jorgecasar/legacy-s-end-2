import { css } from "lit";

export const appStyles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background-color: var(--wa-color-surface-default);
    color: var(--wa-color-text-normal);
    font-family: var(--wa-font-sans);
  }

  main {
    padding: var(--wa-spacing-medium);
    max-width: 1200px;
    margin: 0 auto;
  }
`;
