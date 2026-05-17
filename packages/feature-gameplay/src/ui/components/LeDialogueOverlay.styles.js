import { css } from "lit";

export const dialogueOverlayStyles = css`
  :host {
    position: absolute;
    bottom: var(--wa-spacing-large);
    left: var(--wa-spacing-large);
    right: var(--wa-spacing-large);
    z-index: 100;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host(:not([hidden])) {
    display: flex !important;
  }

  wa-card {
    width: 100%;
  }

  .speaker {
    font-weight: var(--wa-font-weight-bold);
    color: var(--wa-color-brand-on-quiet);
    font-size: var(--wa-font-size-large);
  }

  .text {
    line-height: var(--wa-line-height-normal);
    min-height: 2em;
    padding: var(--wa-spacing-medium) 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }
`;
