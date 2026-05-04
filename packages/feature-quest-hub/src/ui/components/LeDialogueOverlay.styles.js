import { css } from "lit";

export const dialogueOverlayStyles = css`
  :host {
    position: absolute;
    bottom: var(--wa-spacing-large);
    left: var(--wa-spacing-large);
    right: var(--wa-spacing-large);
    background-color: var(--wa-color-surface-raised);
    border: 2px solid var(--wa-color-surface-border);
    color: var(--wa-color-text-normal);
    padding: var(--wa-spacing-large);
    font-family: var(--wa-font-sans);
    display: flex;
    flex-direction: column;
    gap: var(--wa-spacing-medium);
    border-radius: var(--wa-border-radius-medium);
    box-shadow: var(--wa-shadow-large);
    z-index: 100;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host(:not([hidden])) {
    display: flex !important;
  }

  .speaker {
    font-weight: var(--wa-font-weight-bold);
    color: var(--wa-color-brand-on-quiet);
    font-size: var(--wa-font-size-large);
    border-bottom: 1px solid var(--wa-color-surface-border);
    padding-bottom: var(--wa-spacing-x-small);
  }

  .text {
    line-height: var(--wa-line-height-normal);
    min-height: 3em;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  button {
    background-color: var(--wa-color-brand-fill-normal);
    color: var(--wa-color-brand-on-normal);
    border: var(--wa-border-width-s) solid var(--wa-color-brand-border-normal);
    padding: var(--wa-spacing-small) var(--wa-spacing-medium);
    border-radius: var(--wa-border-radius-small);
    cursor: pointer;
    font-weight: var(--wa-font-weight-semibold);
    transition: background-color var(--wa-transition-fast);
  }

  button:hover {
    background-color: var(--wa-color-brand-fill-loud);
  }
`;
