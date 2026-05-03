import { msg } from "@lit/localize";

export const chapterMessages = {
  "chap-01": {
    name: msg("The Awakening"),
  },
};

export const entityDecks = {
  "npc-alarion": {
    talk: [
      {
        type: "narration",
        speaker: msg("Elder Alarion"),
        text: msg("Wake up, hero. The world is ending."),
      },
      {
        type: "narration",
        speaker: msg("Elder Alarion"),
        text: msg("The void is consuming everything. You are our last hope."),
      },
    ],
    codelab: [
      {
        type: "narration",
        speaker: msg("Elder Alarion"),
        text: msg("Wake up, hero. The world is ending."),
      },
    ],
  },
};
