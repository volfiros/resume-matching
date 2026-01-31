import { AgentState } from "../types";
import { callGemini, parseAIResponse } from "../utils/gemini";

export async function matcherAgent(state: AgentState): Promise<AgentState> {
  console.log("Matcher Agent: Starting...");

  const prompt = `
Compare this candidate's profile with job requirements.

CANDIDATE SKILLS:
${state.extractedSkills?.join(", ")}

CANDIDATE EXPERIENCE:
${state.experience}

CANDIDATE EDUCATION:
${state.education}

REQUIRED SKILLS:
${state.jobRequirements?.requiredSkills.join(", ")}

PREFERRED SKILLS:
${state.jobRequirements?.preferredSkills.join(", ")}

REQUIRED EXPERIENCE:
${state.jobRequirements?.experienceYears ? `${state.jobRequirements.experienceYears}+ years` : "Not specified"}

REQUIRED EDUCATION:
${state.jobRequirements?.education || "Not specified"}

Return JSON:
{
  "skillMatches": ["matched skills"],
  "skillGaps": ["missing required skills"],
  "experienceMatch": true/false,
  "educationMatch": true/false
}
`;

  try {
    const response = await callGemini(prompt);
    const matchDetails = parseAIResponse<{
      skillMatches: string[];
      skillGaps: string[];
      experienceMatch: boolean;
      educationMatch: boolean;
    }>(response);

    console.log(
      `Matcher Agent: ${matchDetails.skillMatches.length} skills matched, ${matchDetails.skillGaps.length} gaps`,
    );

    return {
      ...state,
      matchDetails,
    };
  } catch (error) {
    console.error("Matcher Agent failed:", error);
    throw new Error("Failed to match candidate with job");
  }
}
