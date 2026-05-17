import { css } from "lit";

export const heroStyles = css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--wa-color-brand-fill-normal);
    border-radius: var(--wa-border-radius-circle);
    box-shadow: var(--wa-shadow-medium);
    z-index: 10;
    transition: background-color 0.2s;
    color: var(--wa-color-brand-on-normal);
  }

  :host(.colliding) {
    animation: shake 0.2s ease-in-out;
    background-color: var(--wa-color-danger-fill-normal);
  }

  wa-icon {
    font-size: 1.5rem;
  }

  @keyframes shake {
    0%,
    100% {
      margin-left: 0;
    }
    25% {
      margin-left: -5px;
    }
    75% {
      margin-left: 5px;
    }
  }
`;
