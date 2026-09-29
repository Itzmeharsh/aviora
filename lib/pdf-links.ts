import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

type ExtractedLink = {
  text: string;
  url: string;
};

function normalizePdfUrl(value: string): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  // PDF.js can return project URLs like:
  // [https://github.com/example/project](https://github.com/example/project)
  const markdownMatch = trimmed.match(
    /^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/
  );

  if (markdownMatch) {
    return markdownMatch[1];
  }

  return trimmed;
}

export async function extractPdfLinks(
  buffer: Buffer
): Promise<ExtractedLink[]> {
  const pdf = await getDocument({
    data: new Uint8Array(buffer),
  }).promise;

  const links: ExtractedLink[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page = await pdf.getPage(pageNumber);

    const textContent = await page.getTextContent();

    const textItems = textContent.items
      .filter(
        (item: any) =>
          typeof item.str === "string" &&
          item.str.trim()
      )
      .map((item: any) => {
        const [
          scaleX,
          skewX,
          skewY,
          scaleY,
          x,
          y,
        ] = item.transform;

        return {
          text: item.str.trim(),
          x,
          y,
          width: item.width || 0,
          height: Math.abs(scaleY) || 0,
        };
      });

    const annotations = await page.getAnnotations({
      intent: "display",
    });

    for (const annotation of annotations) {
      if (annotation.subtype !== "Link") {
        continue;
      }

      const rawUrl =
        annotation.url ||
        annotation.unsafeUrl ||
        "";

      const url = normalizePdfUrl(rawUrl);

      if (!url) {
        continue;
      }

      const rect = annotation.rect;

      if (!rect || rect.length !== 4) {
        continue;
      }

      const [x1, y1, x2, y2] = rect;

      const annotationCenterX =
        (x1 + x2) / 2;

      const annotationCenterY =
        (y1 + y2) / 2;

      const nearbyText = textItems
        .map((item) => {
          const itemCenterX =
            item.x + item.width / 2;

          const itemCenterY =
            item.y + item.height / 2;

          const verticalDistance =
            Math.abs(
              itemCenterY -
                annotationCenterY
            );

          const horizontalDistance =
            Math.abs(
              itemCenterX -
                annotationCenterX
            );

          return {
            ...item,
            verticalDistance,
            horizontalDistance,
          };
        })
        .filter(
          (item) =>
            item.verticalDistance < 15
        )
        .sort((a, b) => {
          if (
            a.verticalDistance !==
            b.verticalDistance
          ) {
            return (
              a.verticalDistance -
              b.verticalDistance
            );
          }

          return (
            a.horizontalDistance -
            b.horizontalDistance
          );
        });

      const closestText =
        nearbyText[0];

      links.push({
        text:
          closestText?.text || "",
        url,
      });
    }
  }

  return links;
}