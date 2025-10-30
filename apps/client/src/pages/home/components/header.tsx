import { motion } from "framer-motion";
import { Link } from "react-router";

import { Logo } from "@/client/components/logo";

import { DonationBanner } from "./donation-banner";

const isCustomDomain = () => {
  const hostname = window.location.hostname;
  const mainDomains = ["localhost", "josh-reactive-resume-production.up.railway.app"];

  return !mainDomains.some((domain) => hostname.includes(domain));
};

export const Header = () => {
  const isOnCustomDomain = isCustomDomain();

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-20"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3 } }}
    >
      <DonationBanner />

      <div className="bg-gradient-to-b from-background to-transparent py-3">
        <div className="container flex items-center justify-between">
          <Link to="/" className={isOnCustomDomain ? "invisible" : ""}>
            <Logo size={48} />
          </Link>

          <div />
        </div>
      </div>
    </motion.header>
  );
};
