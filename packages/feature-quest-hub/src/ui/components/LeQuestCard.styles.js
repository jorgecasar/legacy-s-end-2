import { css } from "lit";

export const questCardStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 340px;
  }

  .card {
    width: 100%;
    cursor: pointer;
    transition:
      transform var(--wa-transition-fast) ease-in-out,
      box-shadow var(--wa-transition-fast) ease-in-out;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--wa-shadow-medium);
  }

  :host([status="LOCKED"]) .card {
    cursor: not-allowed;
    opacity: 0.7;
    filter: grayscale(1);
  }

  img[slot="media"] {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    margin: 0;
    font-size: var(--wa-font-size-large);
    font-weight: var(--wa-font-weight-bold);
    color: var(--wa-color-neutral-900);
  }

  .level {
    font-size: var(--wa-font-size-small);
    color: var(--wa-color-neutral-600);
  }

  .description {
    margin: 0;
    font-size: var(--wa-font-size-medium);
    color: var(--wa-color-neutral-700);
    line-height: var(--wa-line-height-normal);
  }

  .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;
