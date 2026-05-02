import { css } from "lit";

export const heroStyles = css`
  :host {
    display: block;
    width: 80%;
    height: 80%;
    background-color: var(--wa-color-brand-fill-normal);
    border-radius: var(--wa-border-radius-circle);
    box-shadow: var(--wa-shadow-medium);
    margin: 10%;
    z-index: 10;
  }
`;
