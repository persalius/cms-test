import LandingBuilder from "@/components/LandingBuilder/LandingBuilder";
import { useGetTemplates } from "@/shared/hooks/useGetTemplates";
import { useGetLanding } from "@/shared/hooks/useGetLanding";
import { LandingProvider } from "@/shared/context/landing";
import { TemplateProvider } from "@/shared/context/template";
import { EditorProvider } from "@/shared/context/editor";
import { HTMLInjectorProvider } from "@/shared/context/html-injectors";
import { useGetHtmlInjectors } from "@/shared/hooks/useGetHtmlInjectors";

export default function EditorPage() {
  const { templates } = useGetTemplates();
  const { landingFiles } = useGetLanding();
  const { htmlInjectors } = useGetHtmlInjectors();

  return (
    <LandingProvider landingFiles={landingFiles}>
      <TemplateProvider templatesList={templates}>
        <HTMLInjectorProvider htmlInjectorsList={htmlInjectors}>
          <EditorProvider>
            <LandingBuilder />
          </EditorProvider>
        </HTMLInjectorProvider>
      </TemplateProvider>
    </LandingProvider>
  );
}
