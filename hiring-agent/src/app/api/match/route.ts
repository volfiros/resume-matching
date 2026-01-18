import { NextRequest, NextResponse } from "next/server";
import { runScreeningPipeline } from "@/lib/agents/orchestrator";

/**
 * POST /api/match
 *
 * Expects multipart/form-data with:
 *  - resume: File (pdf/doc/docx)
 *  - jobDescription (string) OR job_text
 *
 * The resume file is read into a Buffer and passed to the screening pipeline
 * along with the filename and job description text.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = (
      request.headers.get("content-type") || ""
    ).toLowerCase();

    // Log incoming content-type for debugging parser issues
    console.log("API /api/match - Incoming Content-Type:", contentType);

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: 'Content-Type must be "multipart/form-data"' },
        { status: 415 },
      );
    }

    const formData = await request.formData();

    const resumeField = formData.get("resume");
    const jobField =
      formData.get("jobDescription") ??
      formData.get("job_text") ??
      formData.get("job") ??
      null;

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

    // resumeField should be a File-like object with arrayBuffer() and name
    // Use a safe cast to access arrayBuffer() in the server environment
    // (Next.js provides a File-like object from formData in server handlers).
    // If arrayBuffer is not a function, we'll return an error.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resumeCandidate: any = resumeField;

    if (typeof resumeCandidate.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Uploaded resume is not a valid file" },
        { status: 400 },
      );
    }

    const ab = await resumeCandidate.arrayBuffer();
    const buffer = Buffer.from(ab);
    const filename = resumeCandidate.name ?? "resume";

    // Server-side validation: only allow PDF and DOCX files.
    const ext = (filename || "").toLowerCase().split(".").pop() ?? "";
    if (!["pdf", "docx"].includes(ext)) {
      return NextResponse.json(
        {
          error:
            "Unsupported resume format. Please upload a PDF (.pdf) or DOCX (.docx) file.",
        },
        { status: 415 },
      );
    }

    // Call the screening pipeline with the resume buffer, filename and job description
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
