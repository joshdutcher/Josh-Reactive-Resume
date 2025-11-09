import { t } from "@lingui/macro";
import { CopySimpleIcon, Plus, TrashSimple } from "@phosphor-icons/react";
import { Button, Input, Label, Switch, Tooltip } from "@reactive-resume/ui";
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
                <span>Custom Domains (Optional)</span>
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
                    {t`Add Custom Domain`}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </section>
  );
};
