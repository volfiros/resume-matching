import { AgentState } from "../types";
import { callGemini, parseAIResponse } from "../utils/gemini";

export async function skillExtractorAgent(
  state: AgentState,
): Promise<AgentState> {
  console.log("Skill Extractor Agent: Starting...");

  const prompt = `
You are a professional resume analyzer. Extract information from this resume.

RESUME:
${state.resumeText}

Extract and return a JSON object with:
{
  "skills": ["skill1", "skill2", ...],
  "experience": "brief summary of total years and key roles",
  "education": "highest degree and field"
}

Focus on technical skills, tools, frameworks, and relevant abilities.
Be comprehensive but avoid duplicates.
`;

  try {
    const response = await callGemini(prompt);
    const extracted = parseAIResponse<{
      skills: string[];
      experience: string;
      education: string;
    }>(response);

    console.log(
      `Skill Extractor Agent: Found ${extracted.skills.length} skills`,
    );

    return {
      ...state,
      extractedSkills: extracted.skills,
      experience: extracted.experience,
      education: extracted.education,
    };
  } catch (error) {
    console.error("Skill Extractor Agent failed:", error);
    throw new Error("Failed to extract skills from resume");
  }
}
