import { css } from "lit";

export const gameLevelStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background-color: var(--wa-color-surface-default);
  }

  header {
    padding: var(--wa-spacing-medium);
    background-color: var(--wa-color-surface-raised);
    border-bottom: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--wa-color-text-normal);
  }

  .chapter-info h2 {
    margin: 0;
    font-size: var(--wa-font-size-large);
    color: var(--wa-color-brand-text-normal);
  }

  .chapter-info p {
    margin: 0;
    font-size: var(--wa-font-size-small);
    color: var(--wa-color-text-quiet);
  }

  main {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast {
    position: fixed;
    bottom: var(--wa-spacing-x-large);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--wa-color-danger-fill-loud);
    color: var(--wa-color-danger-on-loud);
    padding: var(--wa-spacing-medium) var(--wa-spacing-large);
    border-radius: var(--wa-border-radius-medium);
    box-shadow: var(--wa-shadow-large);
    z-index: 2000;
    animation: fade-in-out 3s ease-in-out forwards;
    pointer-events: none;
    font-weight: var(--wa-font-weight-bold);
  }

  @keyframes fade-in-out {
    0% {
      opacity: 0;
      bottom: 0;
    }
    10% {
      opacity: 1;
      bottom: var(--wa-spacing-x-large);
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;
