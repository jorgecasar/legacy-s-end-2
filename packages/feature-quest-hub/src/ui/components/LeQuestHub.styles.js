import { css } from "lit";

export const questHubStyles = css`
  :host {
    display: block;
    padding: var(--wa-spacing-large, 24px);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--wa-spacing-medium, 16px);
  }
  .center-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--wa-spacing-small, 8px);
    padding: var(--wa-spacing-large, 24px);
    font-size: var(--wa-font-size-large, 1.25rem);
    color: var(--wa-color-text-quiet);
  }
  .active-mission {
    background: var(--wa-color-brand-fill-quiet);
    border: 2px solid var(--wa-color-brand-border-normal);
    border-radius: var(--wa-border-radius-medium, 8px);
    padding: var(--wa-spacing-medium, 16px);
    margin-bottom: var(--wa-spacing-large, 24px);
    color: var(--wa-color-text-normal);
  }
  .active-mission h2 {
    margin-top: 0;
    color: var(--wa-color-brand-on-quiet);
  }
`;
