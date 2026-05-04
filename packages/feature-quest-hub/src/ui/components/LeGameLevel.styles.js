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
    background-color: var(--wa-color-neutral-900);
    border-bottom: 1px solid var(--wa-color-neutral-800);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
  }

  .chapter-info h2 {
    margin: 0;
    font-size: var(--wa-font-size-large);
    color: var(--wa-color-brand-400);
  }

  .chapter-info p {
    margin: 0;
    font-size: var(--wa-font-size-small);
    color: var(--wa-color-neutral-400);
  }

  main {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
