import { css } from "lit";

export const gameViewportStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 1000px;
    aspect-ratio: 16 / 9;
    background-color: var(--wa-color-surface-default);
    position: relative;
    overflow: hidden;
    margin: var(--wa-spacing-medium) auto;
    border: var(--wa-border-width-m) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-medium);
  }

  .viewport {
    width: 100%;
    height: 100%;
    position: relative;
    background-size: cover;
    background-position: center;
    transition: background-image 0.5s ease-in-out;
  }

  .viewport[data-background="forest-corrupted"] {
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
      repeating-concentric-radial-gradient(
        circle at 50% 50%,
        #1a0f2e,
        #1a0f2e 10px,
        #2d1b4d 10px,
        #2d1b4d 20px
      );
  }

  .viewport[data-background="forest-cleansed"] {
    background-image:
      linear-gradient(rgba(0, 50, 0, 0.3), rgba(0, 50, 0, 0.3)),
      repeating-concentric-radial-gradient(
        circle at 50% 50%,
        #1b4d2e,
        #1b4d2e 10px,
        #2e7d32 10px,
        #2e7d32 20px
      );
  }

  .exit-zone {
    position: absolute;
    border: var(--wa-border-width-m) solid var(--wa-color-brand-fill-normal);
    border-radius: 50%;
    background-color: var(--wa-color-brand-fill-quiet);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wa-color-brand-on-quiet);
    font-weight: var(--wa-font-weight-bold);
    font-size: var(--wa-font-size-x-small);
    transform: translate(-50%, -50%);
    box-shadow: 0 0 20px var(--wa-color-brand-fill-normal);
    animation: pulse-exit 1.5s infinite ease-in-out;
    text-shadow: 0 1px 2px black;
    z-index: 5;
  }

  @keyframes pulse-exit {
    0% {
      opacity: 0.8;
    }
    70% {
      opacity: 0.4;
    }
    100% {
      opacity: 0.8;
    }
  }

  le-hero {
    position: absolute;
    width: 4.4%; /* Matches hitbox: 2.2 * 2 */
    height: 8.4%; /* Matches hitbox: 4.2 * 2 */
    transform: translate(-50%, -50%); /* Center the hero on its coordinates */
    transition:
      left 0.1s linear,
      top 0.1s linear;
    z-index: 10;
  }

  .npc {
    position: absolute;
    width: 4%;
    height: 8%;
    transform: translate(-50%, -50%);
    color: var(--wa-color-brand-fill-normal);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .npc wa-icon {
    font-size: 2rem;
  }

  .interaction-prompt {
    position: absolute;
    top: -30px;
    background-color: var(--wa-color-brand-fill-loud);
    color: var(--wa-color-brand-on-loud);
    padding: 2px 8px;
    border-radius: var(--wa-border-radius-small);
    font-size: var(--wa-font-size-x-small);
    white-space: nowrap;
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .obstacle {
    position: absolute;
    background-color: var(--wa-color-danger-fill-normal);
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
