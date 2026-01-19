import { ScreeningResult, AgentState } from "../types";
import { documentParserAgent } from "./documentParser";
import { skillExtractorAgent } from "./skillExtractor";
import { jobAnalyzerAgent } from "./jobAnalyzer";
import { matcherAgent } from "./matcher";
import { decisionMakerAgent } from "./decisionMaker";

export async function runScreeningPipeline(
  resumeBuffer: Buffer | null,
  resumeFilename: string | null,
  jobDescription: string,
): Promise<ScreeningResult> {
  console.log("=== Starting Screening Pipeline ===");
  console.log(`Resume: ${resumeFilename || "Not provided"}`);
  console.log(`Job Description: ${jobDescription.substring(0, 100)}...`);

  try {
    // Step 1: Parse documents
    let state: AgentState;

    try {
      state = await documentParserAgent(
        resumeBuffer,
        resumeFilename,
        jobDescription,
      );

      if (!state.resumeText || state.resumeText.trim().length === 0) {
        throw new Error("Resume parsing produced no text");
      }
    } catch (parseError) {
      console.error("Document parsing failed:", parseError);
      return {
        match_score: 0,
        recommendation: "Needs manual review",
        requires_human: true,
        confidence: 0,
        reasoning_summary: `Failed to parse resume: ${
          parseError instanceof Error ? parseError.message : "Unknown error"
        }. Please verify the file format and try again.`,
      };
    }

    try {
      state = await skillExtractorAgent(state);
    } catch (error) {
      console.error("Skill extraction failed:", error);
      return {
        match_score: 0,
        recommendation: "Needs manual review",
        requires_human: true,
        confidence: 0,
        reasoning_summary: `Failed to extract skills from resume: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    try {
      state = await jobAnalyzerAgent(state);
    } catch (error) {
      console.error("Job analysis failed:", error);
      return {
        match_score: 0,
        recommendation: "Needs manual review",
        requires_human: true,
        confidence: 0,
        reasoning_summary: `Failed to analyze job requirements: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    try {
      state = await matcherAgent(state);
    } catch (error) {
      console.error("Matching failed:", error);
      return {
        match_score: 0,
        recommendation: "Needs manual review",
        requires_human: true,
        confidence: 0,
        reasoning_summary: `Failed to match candidate with job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    let result: ScreeningResult;
    try {
      result = await decisionMakerAgent(state);
    } catch (error) {
      console.error("Decision making failed:", error);
      return {
        match_score: 0,
        recommendation: "Needs manual review",
        requires_human: true,
        confidence: 0,
        reasoning_summary: `Failed to make hiring decision: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    console.log("=== Screening Pipeline Complete ===");
    console.log(`Result: ${result.recommendation}`);
    console.log(`Match Score: ${result.match_score}`);

    return result;
  } catch (error) {
    console.error("Unexpected pipeline error:", error);
    return {
      match_score: 0,
      recommendation: "Needs manual review",
      requires_human: true,
      confidence: 0,
      reasoning_summary: `System error: ${
        error instanceof Error ? error.message : String(error)
      }. Manual review required.`,
    };
  }
}
