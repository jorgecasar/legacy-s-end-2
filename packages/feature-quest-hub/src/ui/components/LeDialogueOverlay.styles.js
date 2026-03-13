import { css } from "lit";

export const dialogueOverlayStyles = css`
  :host {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: rgba(20, 20, 20, 0.9);
    border: 2px solid #555;
    color: #eee;
    padding: 20px;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 15px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  :host([hidden]) {
    display: none;
  }

  .speaker {
    font-weight: bold;
    color: #007bff;
    font-size: 1.1em;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
  }

  .text {
    line-height: 1.5;
    min-height: 3em;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: #0056b3;
  }

  button:active {
    background-color: #004085;
  }
`;
