import { css } from "lit";

export const settingsStyles = css`
  :host {
    display: block;
    padding: var(--wa-spacing-medium);
    background-color: var(--wa-color-surface-sunken);
    border: 1px solid var(--wa-color-border-default);
    border-radius: var(--wa-border-radius-medium);
    margin-top: var(--wa-spacing-large);
  }
  select {
    background-color: var(--wa-color-surface-raised);
    color: var(--wa-color-text-normal);
    border: 1px solid var(--wa-color-border-default);
    border-radius: var(--wa-border-radius-medium);
    padding: var(--wa-spacing-xs) var(--wa-spacing-medium);
    font-size: var(--wa-font-size-medium);
    font-family: inherit;
    outline: none;
    cursor: pointer;
    min-width: 140px;
    transition:
      border-color var(--wa-transition-fast),
      box-shadow var(--wa-transition-fast);
  }
  select:focus {
    border-color: var(--wa-color-brand-default);
    box-shadow: 0 0 0 2px var(--wa-color-brand-fill-quiet);
  }
`;
