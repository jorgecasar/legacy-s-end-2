import { css } from "lit";

export const questHubStyles = css`
  :host {
    display: block;
    padding: var(--wa-spacing-large);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--wa-spacing-medium);
  }
  .center-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--wa-spacing-small);
    padding: var(--wa-spacing-large);
    font-size: var(--wa-font-size-large);
    color: var(--wa-color-text-quiet);
  }
  .active-mission {
    background: var(--wa-color-brand-fill-quiet);
    border: var(--wa-border-width-m) solid var(--wa-color-brand-border-normal);
    border-radius: var(--wa-border-radius-medium);
    padding: var(--wa-spacing-medium);
    margin-bottom: var(--wa-spacing-large);
    color: var(--wa-color-text-normal);
  }
  .active-mission h2 {
    margin-top: 0;
    color: var(--wa-color-brand-on-quiet);
  }
`;
