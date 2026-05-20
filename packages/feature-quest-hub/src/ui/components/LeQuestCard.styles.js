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
`;
