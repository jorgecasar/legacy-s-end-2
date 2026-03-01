import { html } from "lit";
import "./le-quest-card.js";
import { QuestStatus } from "../../domain/entities/QuestStatus.js";

export default {
  title: "Components/QuestCard",
  component: "le-quest-card",
  argTypes: {
    status: {
      options: Object.values(QuestStatus),
      control: { type: "select" },
    },
  },
};

const Template = (args) => {
  const quest = {
    id: args.id,
    title: args.title,
    description: args.description,
    status: args.status,
  };

  return html`
    <le-quest-card
      .quest=${quest}
      @quest-selected=${(e) => console.log("Quest selected:", e.detail.quest)}
      @quest-locked-attempt=${(e) => console.log("Locked quest clicked:", e.detail.quest)}
    ></le-quest-card>
  `;
};

export const Available = Template.bind({});
Available.args = {
  id: "q1",
  title: "The Alarion's Awakening",
  description: "Learn the basics of variables and constants.",
  status: QuestStatus.AVAILABLE,
};

export const Locked = Template.bind({});
Locked.args = {
  id: "q2",
  title: "The Syntax of the Ancients",
  description: "Explore control flow and logical operators.",
  status: QuestStatus.LOCKED,
};

export const Completed = Template.bind({});
Completed.args = {
  id: "q3",
  title: "Mastering the Void",
  description: "Deep dive into functions and asynchronous programming.",
  status: QuestStatus.COMPLETED,
};
