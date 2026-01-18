import { AgentState } from "../types";
import { parseDocument } from "../utils/fileParser";

export async function documentParserAgent(
  resumeBuffer: Buffer | null,
  resumeFilename: string | null,
  jobDescription: string,
  state: AgentState = {},
): Promise<AgentState> {
  console.log("Document Parser Agent: Starting...");

  let resumeText = "";

  if (resumeBuffer && resumeFilename) {
    try {
      console.log(
        `Document Parser Agent: Parsing ${resumeFilename} (${resumeBuffer.length} bytes)`,
      );

      resumeText = await parseDocument(resumeBuffer, resumeFilename);

      if (!resumeText || resumeText.trim().length < 50) {
        console.warn(
          `Warning: Parsed resume text is very short (${resumeText?.length ?? 0} chars). ` +
            `This might indicate a parsing issue.`,
        );
      } else {
        console.log(
          `Document Parser Agent: Successfully extracted ${resumeText.length} characters`,
        );
      }
    } catch (error) {
      console.error(
        "Document Parser Agent: Failed to parse resume:",
        error instanceof Error ? error.message : String(error),
      );

      throw new Error(
        `Failed to parse resume: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  } else {
    console.log("Document Parser Agent: No resume provided, skipping parsing");
  }

  return {
    ...state,
    resumeText,
    jobDescription,
  };
}
