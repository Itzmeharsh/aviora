import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { getData } from "pdf-parse/worker";
import { extractPdfLinks } from "@/lib/pdf-links";
import { auth } from "@/auth";

PDFParse.setWorker(getData());

export async function POST(request: Request) {
  try {
    // Require an authenticated user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No PDF file provided",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "Only PDF files are allowed",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const embeddedLinks = await extractPdfLinks(buffer);

    console.log(
      "Aviora PDF Links:",
      embeddedLinks
    );

    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText({
      parseHyperlinks: true,
    });

    console.log("EXTRACTED RESUME TEXT:");
    console.log(result.text);

    await parser.destroy();

    return NextResponse.json({
      success: true,
      filename: file.name,
      pages: result.total,
      text: result.text,
      links: embeddedLinks,
    });
  } catch (error) {
    console.error("Resume parsing error:", error);

    return NextResponse.json(
      {
        error: "Failed to extract text from resume",
      },
      { status: 500 }
    );
  }
}