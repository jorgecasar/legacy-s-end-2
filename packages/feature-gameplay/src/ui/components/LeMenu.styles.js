import { css } from "lit";

export const menuStyles = css`
  :host {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
  }

  :host([open]) {
    display: flex;
  }

  .menu-container {
    background-color: var(--wa-color-surface-raised);
    border: var(--wa-border-width-m) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-large);
    padding: var(--wa-spacing-x-large);
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: var(--wa-spacing-medium);
    box-shadow: var(--wa-shadow-x-large);
    text-align: center;
  }

  h2 {
    margin: 0 0 var(--wa-spacing-medium);
    color: var(--wa-color-brand-text-normal);
    font-size: var(--wa-font-size-x-large);
  }

  .menu-options {
    display: flex;
    flex-direction: column;
    gap: var(--wa-spacing-small);
  }

  wa-button {
    width: 100%;
  }

  .hint {
    font-size: var(--wa-font-size-x-small);
    color: var(--wa-color-text-quiet);
    margin-top: var(--wa-spacing-medium);
  }
`;
