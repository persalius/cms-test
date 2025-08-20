import LandingBuilder from "@/components/LandingBuilder/LandingBuilder";
import { useGetTemplates } from "@/shared/hooks/useGetTemplates";
import { useGetLanding } from "@/shared/hooks/useGetLanding";
import { LandingProvider } from "@/shared/context/landing";
import { TemplateProvider } from "@/shared/context/template";
import { EditorProvider } from "@/shared/context/editor";

export default function EditorPage() {
  const { templates } = useGetTemplates();
  const { landingFiles } = useGetLanding();

  return (
    <LandingProvider landingFiles={landingFiles}>
      <TemplateProvider templatesList={templates}>
        <EditorProvider>
          <LandingBuilder />
        </EditorProvider>
      </TemplateProvider>
    </LandingProvider>
  );
}
