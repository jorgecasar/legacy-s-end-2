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
`;
