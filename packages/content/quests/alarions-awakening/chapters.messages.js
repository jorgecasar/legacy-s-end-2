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
        id: "intro-1",
        type: "narration",
        speaker: msg("Elder Alarion"),
        text: msg("Wake up, hero. The world is ending."),
        nextId: "intro-2",
      },
      {
        id: "intro-2",
        type: "narration",
        speaker: msg("Elder Alarion"),
        text: msg("The void is consuming everything. You are our last hope."),
        nextId: null,
      },
    ],
    codelab: [
      {
        id: "codelab-1",
        type: "narration",
        speaker: msg("Elder Alarion"),
        text: msg("Wake up, hero. The world is ending."),
        nextId: null,
      },
    ],
  },
};
