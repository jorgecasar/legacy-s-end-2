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
    color: var(--wa-color-neutral-600, #666);
  }
  .active-mission {
    background: var(--wa-color-primary-50, #f0f7ff);
    border: 2px solid var(--wa-color-primary-500, #3b82f6);
    border-radius: var(--wa-border-radius-medium, 8px);
    padding: var(--wa-spacing-medium, 16px);
    margin-bottom: var(--wa-spacing-large, 24px);
  }
  .active-mission h2 {
    margin-top: 0;
    color: var(--wa-color-primary-700, #1d4ed8);
  }
`;
