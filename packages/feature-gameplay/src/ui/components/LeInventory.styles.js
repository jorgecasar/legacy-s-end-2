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
    border-radius: var(--wa-border-radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--wa-font-size-x-large);
    transition: all 0.2s ease-in-out;
    position: relative;
  }

  .slot.empty {
    background-color: var(--wa-color-surface-sunken);
    border: 1px dashed rgba(255, 255, 255, 0.15);
    color: var(--wa-color-text-quiet);
  }

  .slot.empty:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.02);
  }

  .slot.occupied {
    background-color: var(--wa-color-brand-fill-quiet);
    border: 1px solid var(--wa-color-brand-fill-normal);
    color: var(--wa-color-brand-text-normal);
    cursor: pointer;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .slot.occupied:hover {
    transform: translateY(-2px) scale(1.05);
    border-color: var(--wa-color-brand-text-normal);
    box-shadow: 0 0 8px var(--wa-color-brand-fill-normal);
  }

  .slot wa-icon {
    font-size: 1.5rem;
    color: inherit;
  }
`;
