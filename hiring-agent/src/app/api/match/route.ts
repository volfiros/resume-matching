import { NextRequest, NextResponse } from "next/server";
import { runScreeningPipeline } from "@/lib/agents/orchestrator";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const resumeField = formData.get("resume");
    const jobField =
      formData.get("jobDescription") ??
      formData.get("job_text") ??
      formData.get("job") ??
      null;

    // Validate inputs
    if (!resumeField) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 },
      );
    }

    if (!jobField) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    if (!(resumeField instanceof File)) {
      return NextResponse.json(
        { error: "Resume must be a file" },
        { status: 400 },
      );
    }

    const filename = resumeField.name;
    const ext = filename.toLowerCase().split(".").pop() ?? "";

    if (!["pdf", "docx", "doc"].includes(ext)) {
      return NextResponse.json(
        {
          error:
            "Unsupported resume format. Please upload a PDF (.pdf) or DOCX (.docx) file.",
        },
        { status: 415 },
      );
    }

    const arrayBuffer = await resumeField.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(
      `API: Processing file ${filename}, size: ${buffer.length} bytes`,
    );

    const jobDescription = String(jobField);

    const result = await runScreeningPipeline(buffer, filename, jobDescription);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
