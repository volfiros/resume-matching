import { AgentState, ScreeningResult } from "../types";
import { callGemini, parseAIResponse } from "../utils/gemini";

export async function decisionMakerAgent(
  state: AgentState,
): Promise<ScreeningResult> {
  console.log("Decision Maker Agent: Starting...");

  if (state.jobRequirements?.isVague) {
    console.log(
      "Decision Maker: Job description is vague - requiring manual review",
    );
    return {
      match_score: 0,
      recommendation: "Needs manual review",
      requires_human: true,
      confidence: 0,
      reasoning_summary:
        "The job description lacks specific technical requirements and clear criteria. " +
        "It contains mostly generic terms like 'coding skills', 'team player', etc. " +
        "Manual review is required to clarify job requirements before candidate evaluation can proceed. " +
        "Please provide a more detailed job description with specific technologies, frameworks, " +
        "and concrete qualifications needed for this role.",
    };
  }

  const prompt = `
You are a hiring decision assistant. Based on the analysis, make a hiring recommendation.

MATCH ANALYSIS:
- Matched Skills: ${state.matchDetails?.skillMatches.join(", ")}
- Missing Skills: ${state.matchDetails?.skillGaps.join(", ")}
- Experience Match: ${state.matchDetails?.experienceMatch}
- Education Match: ${state.matchDetails?.educationMatch}

CANDIDATE BACKGROUND:
- Experience: ${state.experience}
- Education: ${state.education}

Provide a JSON response:
{
  "match_score": 0.0-1.0,
  "recommendation": "Proceed to interview" or "Reject" or "Needs manual review",
  "requires_human": true/false,
  "confidence": 0.0-1.0,
  "reasoning_summary": "clear explanation"
}

GUIDELINES:
- match_score: Based on skill matches, experience, and education fit
- requires_human: true if borderline case or missing critical info
- confidence: How certain you are about this decision
- recommendation:
  * "Proceed to interview" if strong match (score > 0.6)
  * "Needs manual review" if uncertain (score 0.4-0.6)
  * "Reject" if poor match (score < 0.4)
`;

  try {
    const response = await callGemini(prompt);
    const decision = parseAIResponse<ScreeningResult>(response);

    console.log(
      `🎓 Decision Maker Agent: ${decision.recommendation} (score: ${decision.match_score})`,
    );

    return decision;
  } catch (error) {
    console.error("Decision Maker Agent failed:", error);
    throw new Error("Failed to make hiring decision");
  }
}
