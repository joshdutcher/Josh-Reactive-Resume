import { ScrollArea } from "@reactive-resume/ui";
import { Outlet, useLoaderData } from "react-router";
import type { ResumeDto } from "@reactive-resume/dto";

import { Footer } from "./components/footer";
import { Header } from "./components/header";

export const HomeLayout = () => {
  const data = useLoaderData<ResumeDto | null>();

  // Hide header and footer when displaying a resume via custom domain
  const isCustomDomainResume = data && "id" in data && "data" in data;

  return (
    <ScrollArea orientation="vertical" className="h-screen">
      {!isCustomDomainResume && <Header />}
      <Outlet />
      {!isCustomDomainResume && <Footer />}
    </ScrollArea>
  );
};
