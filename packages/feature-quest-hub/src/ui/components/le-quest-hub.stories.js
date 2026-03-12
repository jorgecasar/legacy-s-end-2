import { ContextProvider } from "@lit/context";
import { QuestStatus } from "../../domain/entities/QuestStatus.js";
import { StaticQuestRepository } from "../../infrastructure/StaticQuestRepository.js";
import { ListAvailableQuestsInteractor } from "../../use-cases/ListAvailableQuestsInteractor.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
import "./le-quest-hub.js";

export default {
  title: "Features/Quest Hub/le-quest-hub",
  component: "le-quest-hub",
};

export const Default = {
  render: () => {
    const container = document.createElement("div");

    // ENSAMBLAJE (Clean Architecture Composition Root)
    const mockQuests = [
      {
        id: "q1",
        title: "Story: Awakening",
        status: QuestStatus.AVAILABLE,
        description: "Learning context.",
        image: "",
        level: 1,
      },
      {
        id: "q2",
        title: "Story: Syntax",
        status: QuestStatus.LOCKED,
        description: "Locked mission.",
        image: "",
        level: 2,
      },
      {
        id: "q3",
        title: "Story: Master",
        status: QuestStatus.COMPLETED,
        description: "Done.",
        image: "",
        level: 3,
      },
    ];
    const repository = new StaticQuestRepository(mockQuests);
    const useCase = new ListAvailableQuestsInteractor(repository);

    // Proveemos el CASO DE USO (Interfaz), inyectando el Interactor (Implementación)
    new ContextProvider(container, {
      context: questUseCaseContext,
      initialValue: useCase,
    });

    const element = document.createElement("le-quest-hub");
    container.appendChild(element);

    return container;
  },
};
