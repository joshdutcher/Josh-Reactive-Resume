import { t } from "@lingui/macro";
import { CircleNotchIcon, FilePdfIcon } from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { Button } from "@reactive-resume/ui";
import { pageSizeMap } from "@reactive-resume/utils";
import { useCallback, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import type { LoaderFunction } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Icon } from "@/client/components/icon";
import { ThemeSwitch } from "@/client/components/theme-switch";
import { usePrintResume } from "@/client/services/resume";
import { axios } from "@/client/libs/axios";
import { HomePage } from "../home/page";

const openInNewTab = (url: string) => {
  const win = window.open(url, "_blank");
  if (win) win.focus();
};

export const CustomDomainPage = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const { printResume, loading } = usePrintResume();

  const resumeData = useLoaderData();

  // If no resume data, this is not a custom domain - show the home page
  if (!resumeData) {
    return <HomePage />;
  }

  const { id, title, data: resume } = resumeData;

  // Defensive check: ensure resume data has the required nested structure
  // If metadata.page is missing, use sensible defaults to prevent crashes
  if (!resume?.metadata?.page) {
    console.warn("Resume data missing metadata.page structure, using defaults", {
      id,
      hasResume: !!resume,
      hasMetadata: !!resume?.metadata,
    });
  }

  const format = (resume?.metadata?.page?.format ?? "a4") as keyof typeof pageSizeMap;

  const updateResumeInFrame = useCallback(() => {
    const message = { type: "SET_RESUME", payload: resume };

    setImmediate(() => {
      frameRef.current?.contentWindow?.postMessage(message, "*");
    });
  }, [frameRef.current, resume]);

  useEffect(() => {
    if (!frameRef.current) return;
    frameRef.current.addEventListener("load", updateResumeInFrame);
    return () => frameRef.current?.removeEventListener("load", updateResumeInFrame);
  }, [frameRef]);

  useEffect(() => {
    if (!frameRef.current?.contentWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (!frameRef.current?.contentWindow) return;
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "PAGE_LOADED") {
        frameRef.current.width = event.data.payload.width;
        frameRef.current.height = event.data.payload.height;
        frameRef.current.contentWindow.removeEventListener("message", handleMessage);
      }
    };

    frameRef.current.contentWindow.addEventListener("message", handleMessage);

    return () => {
      frameRef.current?.contentWindow?.removeEventListener("message", handleMessage);
    };
  }, [frameRef]);

  const onDownloadPdf = async () => {
    const { url } = await printResume({ id });

    openInNewTab(url);
  };

  return (
    <div>
      <Helmet>
        <title>
          {title} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div
        style={{ width: `${pageSizeMap[format].width}mm` }}
        className="relative z-50 overflow-hidden rounded shadow-xl sm:mx-auto sm:mb-6 sm:mt-16 print:m-0 print:shadow-none"
      >
        <iframe
          ref={frameRef}
          title={title}
          src="/artboard/preview"
          style={{ width: `${pageSizeMap[format].width}mm`, overflow: "hidden" }}
        />
      </div>

      <div className="hidden justify-center py-10 opacity-50 sm:flex print:hidden">
        <Link to="/">
          <Button size="sm" variant="ghost" className="space-x-1.5 text-xs font-normal">
            <span>{t`Built with`}</span>
            <Icon size={12} />
            <span>{t`Reactive Resume`}</span>
          </Button>
        </Link>
      </div>

      <div className="fixed bottom-5 right-5 z-0 hidden sm:block print:hidden">
        <div className="flex flex-col items-center gap-y-2">
          <Button size="icon" variant="ghost" onClick={onDownloadPdf}>
            {loading ? (
              <CircleNotchIcon size={20} className="animate-spin" />
            ) : (
              <FilePdfIcon size={20} />
            )}
          </Button>

          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
};

export const customDomainLoader: LoaderFunction<ResumeDto> = async () => {
  try {
    // Call the API endpoint that detects the custom domain
    const response = await axios.get<ResumeDto>("/api/domain/current");
    return response.data;
  } catch (error) {
    // If this is not a custom domain, return null to indicate we should show the home page
    return null;
  }
};
