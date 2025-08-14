import { EditorProvider } from "@/shared/editor/context";
import LandingBuilder from "@/components/LandingBuilder/LandingBuilder";
import { useGetTemplates } from "@/shared/hooks/useGetTemplates";
import { useGetLanding } from "@/shared/hooks/useGetLanding";
import { LandingProvider } from "@/shared/landing/context/LandingProvider";
import { TemplateProvider } from "@/shared/template/context";

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
