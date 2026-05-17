import { css } from "lit";

export const settingsStyles = css`
  :host {
    display: block;
    padding: var(--wa-spacing-medium);
    background-color: var(--wa-color-surface-sunken);
    border: 1px solid var(--wa-color-border-default);
    border-radius: var(--wa-radius-medium);
    margin-top: var(--wa-spacing-large);
  }

  h2 {
    margin-top: 0;
    font-size: var(--wa-font-size-large);
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: var(--wa-spacing-medium);
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--wa-spacing-medium);
  }

  .info {
    font-size: var(--wa-font-size-small);
    color: var(--wa-color-text-subtle);
    margin-top: calc(-1 * var(--wa-spacing-small));
    margin-bottom: var(--wa-spacing-small);
  }

  .unavailable {
    color: var(--wa-color-danger-default);
  }

  .status-badge {
    font-size: var(--wa-font-size-tiny);
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--wa-color-surface-default);
    border: 1px solid var(--wa-color-border-default);
  }
`;
