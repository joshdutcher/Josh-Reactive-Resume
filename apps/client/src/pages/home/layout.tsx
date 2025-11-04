import { ScrollArea } from "@reactive-resume/ui";
import { Outlet } from "react-router";

import { Footer } from "./components/footer";
import { Header } from "./components/header";

const isCustomDomain = () => {
  const hostname = window.location.hostname;
  const mainDomains = ["localhost", "josh-reactive-resume-production.up.railway.app"];

  return !mainDomains.some((domain) => hostname.includes(domain));
};

export const HomeLayout = () => (
  <ScrollArea orientation="vertical" className="h-screen">
    <Header />
    <Outlet />
    {!isCustomDomain() && <Footer />}
  </ScrollArea>
);
