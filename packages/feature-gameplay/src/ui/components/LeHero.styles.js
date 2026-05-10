import { css } from "lit";

export const heroStyles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    background-color: var(--wa-color-brand-fill-normal);
    border-radius: var(--wa-border-radius-circle);
    box-shadow: var(--wa-shadow-medium);
    z-index: 10;
  }
`;
