import { t } from "@lingui/macro";
import { CopySimpleIcon, Plus, Question, TrashSimple } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Tooltip,
} from "@reactive-resume/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import { useUser } from "@/client/services/user";
import { useResumeStore } from "@/client/stores/resume";

import { SectionIcon } from "../shared/section-icon";

export const SharingSection = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const username = user?.username;

  const setValue = useResumeStore((state) => state.setValue);
  const slug = useResumeStore((state) => state.resume.slug);
  const customDomains = useResumeStore((state) => state.resume.customDomains || []);
  const isPublic = useResumeStore((state) => state.resume.visibility === "public");

  // Local state for domain management
  const [domains, setDomains] = useState<string[]>([]);
  const [domainErrors, setDomainErrors] = useState<Record<number, string>>({});
  const [dnsHelpOpen, setDnsHelpOpen] = useState(false);

  // Sync with store on load
  useEffect(() => {
    const filtered = customDomains.filter((d) => d && d.trim() !== "");
    if (filtered.length > 0) {
      setDomains(filtered);
    }
  }, [customDomains]);

  // Constants
  const url = `${window.location.origin}/${username}/${slug}`;

  // Domain validation helper
  const validateDomain = (domain: string, index: number): string | null => {
    if (!domain.trim()) return null;

    // Strip protocol and slashes for validation
    const cleaned = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").trim();

    // Basic hostname validation
    const hostnameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (!hostnameRegex.test(cleaned)) {
      return t`Invalid domain format`;
    }

    // Check for duplicates (case-insensitive)
    const cleanedDomains = domains.map((d) =>
      d.replace(/^https?:\/\//, "").replace(/\/$/, "").trim().toLowerCase(),
    );
    const duplicateCount = cleanedDomains.filter((d) => d === cleaned.toLowerCase()).length;
    if (duplicateCount > 1) {
      return t`Domain already added`;
    }

    return null;
  };

  // Add new domain field
  const addDomain = () => {
    if (domains.length < 5) {
      setDomains([...domains, ""]);
    }
  };

  // Update domain value
  const updateDomain = (index: number, value: string) => {
    const updated = [...domains];
    updated[index] = value;
    setDomains(updated);

    // Validate
    const error = validateDomain(value, index);
    setDomainErrors((prev) => ({
      ...prev,
      [index]: error || "",
    }));

    // Save to store (filter empty and clean)
    const filtered = updated
      .map((d) => d.replace(/^https?:\/\//, "").replace(/\/$/, "").trim())
      .filter((d) => d !== "");
    setValue("customDomains", filtered);
  };

  // Remove domain field
  const removeDomain = (index: number) => {
    const updated = domains.filter((_, i) => i !== index);
    setDomains(updated);

    // Clear error for this index and reindex remaining errors
    const newErrors: Record<number, string> = {};
    Object.entries(domainErrors).forEach(([key, value]) => {
      const keyNum = Number(key);
      if (keyNum < index) {
        newErrors[keyNum] = value;
      } else if (keyNum > index) {
        newErrors[keyNum - 1] = value;
      }
    });
    setDomainErrors(newErrors);

    // Save
    const filtered = updated
      .map((d) => d.replace(/^https?:\/\//, "").replace(/\/$/, "").trim())
      .filter((d) => d !== "");
    setValue("customDomains", filtered);
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(url);

    toast({
      variant: "success",
      title: t`A link has been copied to your clipboard.`,
      description: t`Anyone with this link can view and download the resume. Share it on your profile or with recruiters.`,
    });
  };

  return (
    <section id="sharing" className="grid gap-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <SectionIcon id="sharing" size={18} name={t`Sharing`} />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{t`Sharing`}</h2>
        </div>
      </header>

      <main className="grid gap-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-x-4">
            <Switch
              id="visibility"
              checked={isPublic}
              onCheckedChange={(checked) => {
                setValue("visibility", checked ? "public" : "private");
              }}
            />
            <div>
              <Label htmlFor="visibility" className="space-y-1">
                <p>{t`Public`}</p>
                <p className="text-xs opacity-60">
                  {t`Anyone with the link can view and download the resume.`}
                </p>
              </Label>
            </div>
          </div>
        </div>

        <AnimatePresence presenceAffectsLayout>
          {isPublic && (
            <motion.div
              layout
              className="space-y-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Label htmlFor="resume-url">{t`URL`}</Label>

              <div className="flex gap-x-1.5">
                <Input readOnly id="resume-url" value={url} className="flex-1" />

                <Tooltip content={t`Copy to Clipboard`}>
                  <Button size="icon" variant="ghost" onClick={onCopy}>
                    <CopySimpleIcon />
                  </Button>
                </Tooltip>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence presenceAffectsLayout>
          {isPublic && (
            <motion.div
              layout
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Label className="flex items-center justify-between">
                <span className="flex items-center gap-x-1.5">
                  Custom Domains (Optional)
                  <Tooltip content="DNS Configuration Help">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDnsHelpOpen(true)}
                      className="h-5 w-5"
                    >
                      <Question size={16} />
                    </Button>
                  </Tooltip>
                </span>
                <span className="text-xs text-muted-foreground">
                  {domains.filter((d) => d.trim()).length} of 5
                </span>
              </Label>

              <div className="space-y-2">
                {domains.map((domain, index) => (
                  <div key={index}>
                    <div className="flex gap-x-1.5">
                      <Input
                        value={domain}
                        placeholder="resume.yourdomain.com"
                        onChange={(e) => updateDomain(index, e.target.value)}
                        className="flex-1"
                      />
                      <Tooltip content={t`Remove`}>
                        <Button size="icon" variant="ghost" onClick={() => removeDomain(index)}>
                          <TrashSimple />
                        </Button>
                      </Tooltip>
                    </div>
                    {domainErrors[index] && (
                      <p className="mt-1 text-xs text-destructive">{domainErrors[index]}</p>
                    )}
                  </div>
                ))}

                {domains.length < 5 && (
                  <Button variant="outline" onClick={addDomain} className="w-full">
                    <Plus className="mr-2" size={16} />
                    Add Custom Domain
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Dialog open={dnsHelpOpen} onOpenChange={setDnsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>DNS Configuration Required</DialogTitle>
            <DialogDescription>
              To use a custom domain with your resume, you need to configure your DNS settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Step 1: Create a CNAME Record</h4>
              <p className="mb-2 text-sm text-muted-foreground">
                Log in to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare) and create a
                CNAME record with these settings:
              </p>
              <div className="space-y-1 rounded-md bg-secondary p-3 font-mono text-sm">
                <div>
                  <span className="font-semibold">Type:</span> CNAME
                </div>
                <div>
                  <span className="font-semibold">Name:</span> resume (or your preferred subdomain)
                </div>
                <div>
                  <span className="font-semibold">Target:</span>{" "}
                  {window.location.hostname.replace(/^www\./, "")}
                </div>
                <div>
                  <span className="font-semibold">TTL:</span> Auto or 3600
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Step 2: Add Domain Above</h4>
              <p className="text-sm text-muted-foreground">
                Enter your custom domain in the field above (e.g., resume.yourdomain.com)
              </p>
            </div>

            {domains.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Your Configured Domains</h4>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {domains
                    .filter((d) => d.trim())
                    .map((domain, index) => (
                      <li key={index} className="text-muted-foreground">
                        {domain}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Note:</strong> DNS changes may take 24-48 hours to propagate globally.
                After configuration, test your custom domain in an incognito window.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
