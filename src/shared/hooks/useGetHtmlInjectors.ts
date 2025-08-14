import type { HTMLInjectorList } from "../types/html-injector";

const mockHtmlInjectorsFromGithub: HTMLInjectorList = {
  gtm: {
    "/injector.json": {
      code: `{
        "id": "gtm",
        "name": "Google Tag Manager",
        "description": "Injects Google Tag Manager script",
        "templateString": "<!-- @GTMInjector -->",
        "version": "1.0.0",
        "attributes": {
          "gtm-id": "GTM-XXXXXX"
        }
      }`,
    },
  },
};

export const useGetHtmlInjectors = () => {
  return { htmlInjectors: mockHtmlInjectorsFromGithub };
};
