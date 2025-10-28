import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { Helmet } from "react-helmet-async";
import type { LoaderFunction } from "react-router";
import { useLoaderData } from "react-router";

import { queryClient } from "@/client/libs/query-client";
import { findResumeByCustomDomain } from "@/client/services/resume";

import { PublicResumePage } from "../public/page";
import { ContributorsSection } from "./sections/contributors";
import { FAQSection } from "./sections/faq";
import { FeaturesSection } from "./sections/features";
import { HeroSection } from "./sections/hero";
import { LogoCloudSection } from "./sections/logo-cloud";
import { StatisticsSection } from "./sections/statistics";
import { SupportSection } from "./sections/support";
import { TemplatesSection } from "./sections/templates";
import { TestimonialsSection } from "./sections/testimonials";

const isCustomDomain = () => {
  const hostname = window.location.hostname;
  const mainDomains = [
    "localhost",
    "josh-reactive-resume-production.up.railway.app",
    "7tqgqcqr.up.railway.app",
  ];

  return !mainDomains.some((domain) => hostname.includes(domain));
};

export const HomePage = () => {
  const { i18n } = useLingui();
  const data = useLoaderData() as { isCustomDomain: boolean; resume?: ResumeDto } | null;

  // If this is a custom domain with a resume, render the public resume page
  if (data?.isCustomDomain && data.resume) {
    return <PublicResumePage />;
  }

  return (
    <main className="relative isolate bg-background">
      <Helmet prioritizeSeoTags>
        <html lang={i18n.locale} />

        <title>
          {t`Reactive Resume`} - {t`A free and open-source resume builder`}
        </title>

        <meta
          name="description"
          content="A free and open-source resume builder that simplifies the process of creating, updating, and sharing your resume."
        />
      </Helmet>

      <HeroSection />
      <LogoCloudSection />
      <StatisticsSection />
      <FeaturesSection />
      <TemplatesSection />
      <TestimonialsSection />
      <SupportSection />
      <FAQSection />
      <ContributorsSection />
    </main>
  );
};

export const homeLoader: LoaderFunction = async () => {
  if (isCustomDomain()) {
    try {
      const resume = await queryClient.fetchQuery({
        queryKey: ["resume", "custom-domain", window.location.hostname],
        queryFn: () => findResumeByCustomDomain(),
      });

      return { isCustomDomain: true, resume };
    } catch {
      // Custom domain configured but resume not found - show home page
      return { isCustomDomain: false };
    }
  }

  return { isCustomDomain: false };
};
