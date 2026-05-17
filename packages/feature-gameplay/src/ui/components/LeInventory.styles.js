import { css } from "lit";

export const inventoryStyles = css`
  :host {
    display: block;
    position: absolute;
    bottom: var(--wa-spacing-medium);
    left: var(--wa-spacing-medium);
    z-index: 100;
  }

  .inventory-bar {
    display: flex;
    gap: var(--wa-spacing-small);
    background-color: rgba(0, 0, 0, 0.7);
    padding: var(--wa-spacing-small);
    border-radius: var(--wa-border-radius-medium);
    border: var(--wa-border-width-m) solid var(--wa-color-surface-border);
    backdrop-filter: blur(4px);
    box-shadow: var(--wa-shadow-large);
  }

  .slot {
    width: 48px;
    height: 48px;
    background-color: var(--wa-color-surface-sunken);
    border-radius: var(--wa-border-radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wa-color-text-quiet);
    font-size: 1.5rem;
    transition: transform 0.2s ease-in-out;
    position: relative;
  }

  .slot.occupied {
    background-color: var(--wa-color-brand-fill-quiet);
    color: var(--wa-color-brand-fill-normal);
  }

  .slot.occupied:hover {
    transform: scale(1.1);
  }
`;
