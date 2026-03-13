import { css } from "lit";

export const gameViewportStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 800px;
    aspect-ratio: 4 / 3;
    background-color: #1a1a1a;
    position: relative;
    overflow: hidden;
    margin: 0 auto;
    border: 4px solid #333;
  }

  .grid {
    display: grid;
    width: 100%;
    height: 100%;
  }

  .tile {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 1px solid #222;
  }

  .tile[data-type="1"] {
    background-color: #444; /* Wall */
  }

  .tile[data-type="0"] {
    background-color: #2a2a2a; /* Floor */
  }
`;
