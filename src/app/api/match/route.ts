import { NextRequest, NextResponse } from "next/server";
import { parseDocument } from "@/lib/utils/fileParser";
import { siftGraph } from "@/lib/agents/graph";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const jobDescription = formData.get("jobDescription") as string | null;
  const geminiApiKey = formData.get("geminiApiKey") as string | null;
  const resumes = formData.getAll("resumes") as File[];

  if (!jobDescription?.trim()) {
    return NextResponse.json({ error: "Job description is required" }, { status: 400 });
  }

  if (!geminiApiKey?.trim()) {
    return NextResponse.json({ error: "Gemini API key is required" }, { status: 400 });
  }

  if (!resumes.length) {
    return NextResponse.json({ error: "At least one resume is required" }, { status: 400 });
  }

  for (const file of resumes) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) {
      return NextResponse.json({ error: `Unsupported file: ${file.name}` }, { status: 415 });
    }
  }

  try {
    const results = await Promise.all(
      resumes.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const resumeText = await parseDocument(buffer, file.name);

        const output = await siftGraph.invoke({
          resumeText,
          jobDescription,
          geminiApiKey,
        });

        return {
          resumeName: file.name,
          candidateName: output.candidateName ?? "",
          ...(output.result ?? {
            matchScore: 0,
            confidence: 0,
            recommendation: "Needs manual review",
            requiresHuman: true,
            reasoning: "Processing failed — human review required.",
          }),
        };
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Screening failed" },
      { status: 500 }
    );
  }
}
