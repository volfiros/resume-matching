import { AgentState } from "../types";
import { callGemini, parseAIResponse } from "../utils/gemini";

export async function jobAnalyzerAgent(state: AgentState): Promise<AgentState> {
  console.log("Job Analyzer Agent: Starting...");

  const prompt = `
You are a job requirements analyzer. Extract key requirements from this job description.

JOB DESCRIPTION:
${state.jobDescription}

Return a JSON object with:
{
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredSkills": ["skill1", "skill2", ...],
  "experienceYears": number or null,
  "education": "required education level or null"
}

Required skills are must-haves. Preferred skills are nice-to-haves.
`;

  try {
    const response = await callGemini(prompt);
    const requirements = parseAIResponse<{
      requiredSkills: string[];
      preferredSkills: string[];
      experienceYears: number | null;
      education: string | null;
    }>(response);

    console.log(
      `Job Analyzer Agent: Found ${requirements.requiredSkills.length} required skills`,
    );

    return {
      ...state,
      jobRequirements: {
        requiredSkills: requirements.requiredSkills,
        preferredSkills: requirements.preferredSkills,
        experienceYears: requirements.experienceYears ?? undefined,
        education: requirements.education ?? undefined,
      },
    };
  } catch (error) {
    console.error("Job Analyzer Agent failed:", error);
    throw new Error("Failed to analyze job requirements");
  }
}
