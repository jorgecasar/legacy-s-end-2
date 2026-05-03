import { css } from "lit";

export const gameViewportStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 1000px;
    aspect-ratio: 16 / 9;
    background-color: var(--wa-color-neutral-900);
    position: relative;
    overflow: hidden;
    margin: var(--wa-spacing-medium) auto;
    border: 4px solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-medium);
  }

  .viewport {
    width: 100%;
    height: 100%;
    position: relative;
  }

  le-hero {
    position: absolute;
    width: 4%; /* Approx size relative to viewport */
    height: 8%;
    transform: translate(-50%, -50%); /* Center the hero on its coordinates */
    transition:
      left 0.1s linear,
      top 0.1s linear;
  }

  .obstacle {
    position: absolute;
    background-color: var(--wa-color-danger-900);
    opacity: 0.3; /* Subtle debug visualization */
    pointer-events: none;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--wa-color-text-quiet);
  }
`;
