import { configureLocalization } from "@lit/localize";
import { templates as esTemplates } from "./generated/es.js";

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale: "en",
  targetLocales: ["es"],
  loadLocale: async (locale) => {
    switch (locale) {
      case "es":
        return { templates: esTemplates };
      default:
        throw new Error(`Locale ${locale} not found`);
    }
  },
});
