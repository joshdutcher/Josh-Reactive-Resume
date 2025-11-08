import type { SectionKey } from "@reactive-resume/schema";
import type { Template } from "@reactive-resume/utils";
import { useMemo } from "react";

import { Page } from "../components/page";
import { useArtboardStore } from "../store/artboard";
import { getTemplate } from "../templates";

// Helper function to merge all pages into a single continuous layout
const mergeLayout = (layout: SectionKey[][][]): SectionKey[][] => {
  if (layout.length === 0) return [];
  if (layout.length === 1) return layout[0];

  // Get the maximum number of columns across all pages
  const maxColumns = Math.max(...layout.map((page) => page.length));

  // Initialize merged columns array
  const merged: SectionKey[][] = Array.from({ length: maxColumns }, () => []);

  // Merge each column across all pages
  for (const page of layout) {
    for (const [columnIndex, column] of page.entries()) {
      merged[columnIndex].push(...column);
    }
  }

  return merged;
};

export const PreviewLayout = () => {
  const layout = useArtboardStore((state) => state.resume.metadata.layout);
  const template = useArtboardStore((state) => state.resume.metadata.template as Template);
  const hidePageBreaksWeb = useArtboardStore(
    (state) => state.resume.metadata.page.options.hidePageBreaksWeb,
  );

  const Template = useMemo(() => getTemplate(template), [template]);

  // Check if we're in PDF generation mode (via URL parameter)
  const isPdfMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('pdf') === 'true';
  }, []);

  // If hidePageBreaksWeb is enabled AND we're not in PDF mode, merge all pages into one
  if (hidePageBreaksWeb && !isPdfMode) {
    const mergedColumns = mergeLayout(layout as SectionKey[][][]);

    return (
      <Page singlePageMode mode="preview" pageNumber={1}>
        <Template isFirstPage columns={mergedColumns} />
      </Page>
    );
  }

  // Default multi-page rendering
  return (
    <>
      {layout.map((columns, pageIndex) => (
        <Page key={pageIndex} mode="preview" pageNumber={pageIndex + 1}>
          <Template isFirstPage={pageIndex === 0} columns={columns as SectionKey[][]} />
        </Page>
      ))}
    </>
  );
};
