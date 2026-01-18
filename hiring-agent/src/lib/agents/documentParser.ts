import { AgentState } from "../types";
import { parseDocument } from "../utils/fileParser";

export async function documentParserAgent(
  resumeBuffer: Buffer | null,
  resumeFilename: string | null,
  jobDescription: string,
  state: AgentState = {},
): Promise<AgentState> {
  console.log("Document Parser Agent: Starting...");

  try {
    let resumeText = "";
    if (resumeBuffer && resumeFilename) {
      try {
        console.log(
          `Document Parser Agent: parsing resume ${resumeFilename} (bytes=${resumeBuffer.byteLength ?? (resumeBuffer as Buffer).length})`,
        );

        const parsed = await parseDocument(resumeBuffer, resumeFilename);

        resumeText = parsed ?? "";

        if (!resumeText || resumeText.trim().length < 50) {
          console.warn(
            "Document Parser Agent: parsed resume text is unexpectedly short",
            { filename: resumeFilename, length: resumeText?.length ?? 0 },
          );
        } else {
          console.log(
            `Document Parser Agent: Extracted ${resumeText.length} characters`,
          );
        }
      } catch (parseErr) {
        console.error(
          "Document Parser Agent: Failed to parse resume. Continuing without resume text.",
          {
            filename: resumeFilename,
            error:
              parseErr instanceof Error ? parseErr.message : String(parseErr),
          },
        );
        resumeText = "";
      }
    } else {
      console.log(
        "Document Parser Agent: No resume provided; skipping parsing.",
      );
    }

    return {
      ...state,
      resumeText,
      jobDescription,
    };
  } catch (error) {
    console.error("Document Parser Agent failed:", error);
    throw error;
  }
}
