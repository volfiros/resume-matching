import { ScreeningResult, AgentState } from "../types";
import { documentParserAgent } from "./documentParser";
import { skillExtractorAgent } from "./skillExtractor";
import { jobAnalyzerAgent } from "./jobAnalyzer";
import { matcherAgent } from "./matcher";
import { decisionMakerAgent } from "./decisionMaker";

/**
 * runScreeningPipeline
 *
 * Runs the end-to-end screening pipeline. This function:
 * - Accepts an optional resume buffer + filename (may be null when client sends only job text).
 * - Attempts to parse the resume when provided. If parsing fails, logs the error and proceeds
 *   with a minimal state containing only the jobDescription so downstream agents can still run.
 * - Runs the rest of the agents in sequence and returns the final ScreeningResult.
 *
 * The function is defensive: it never throws for resume parsing failures (parsing errors are
 * logged and the pipeline continues). If any downstream step fails, it returns a safe fallback
 * ScreeningResult asking for manual review.
 */
export async function runScreeningPipeline(
  resumeBuffer: Buffer | null,
  resumeFilename: string | null,
  jobDescription: string,
): Promise<ScreeningResult> {
  console.log("Starting Screening Pipeline...");

  try {
    // Start with a minimal state containing the job description.
    let state: AgentState = { jobDescription };

    // If a resume buffer + filename are provided, try to parse it.
    if (resumeBuffer && resumeFilename) {
      try {
        console.log(
          `Orchestrator: parsing resume '${resumeFilename}' (bytes=${resumeBuffer.byteLength ?? resumeBuffer.length})`,
        );
        state = await documentParserAgent(
          resumeBuffer,
          resumeFilename,
          jobDescription,
        );
      } catch (parseErr) {
        // Log parse error, but continue the pipeline using only jobDescription.
        console.error(
          "Orchestrator: documentParserAgent failed, continuing without resumeText:",
          parseErr instanceof Error ? parseErr.message : String(parseErr),
        );
        state = { jobDescription };
      }
    } else {
      console.log(
        "Orchestrator: no resume buffer provided, continuing with job description only.",
      );
    }

    // Continue pipeline
    state = await skillExtractorAgent(state);
    state = await jobAnalyzerAgent(state);
    state = await matcherAgent(state);
    const result = await decisionMakerAgent(state);

    console.log("Screening Pipeline Complete!");
    return result;
  } catch (error) {
    console.error("Pipeline failed:", error);

    // Safe fallback result that indicates manual review is needed.
    return {
      match_score: 0,
      recommendation: "Needs manual review",
      requires_human: true,
      confidence: 0,
      reasoning_summary: `System error: ${error instanceof Error ? error.message : String(error)}. Manual review required.`,
    };
  }
}
