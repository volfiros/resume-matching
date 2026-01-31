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
Be specific - avoid generic terms like "coding skills", "programming knowledge".
Extract actual technologies, frameworks, or specific competencies.
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

    const isVague = detectVagueJobDescription(
      requirements,
      state.jobDescription || "",
    );

    if (isVague) {
      console.warn(
        "Job description appears vague - flagging for manual review",
      );
    }

    return {
      ...state,
      jobRequirements: {
        requiredSkills: requirements.requiredSkills,
        preferredSkills: requirements.preferredSkills,
        experienceYears: requirements.experienceYears ?? undefined,
        education: requirements.education ?? undefined,
        isVague, // ADD THIS
      },
    };
  } catch (error) {
    console.error("Job Analyzer Agent failed:", error);
    throw new Error("Failed to analyze job requirements");
  }
}

function detectVagueJobDescription(
  requirements: {
    requiredSkills: string[];
    preferredSkills: string[];
    experienceYears: number | null;
    education: string | null;
  },
  jobDescription: string,
): boolean {
  if (requirements.requiredSkills.length === 0) {
    console.log("Vague indicator: No required skills found");
    return true;
  }

  const vagueKeywords = [
    "coding",
    "programming",
    "development",
    "software",
    "technology",
    "experience",
    "skills",
    "knowledge",
    "good",
    "team player",
    "communication",
    "self-motivated",
    "quick learner",
  ];

  const hasOnlyVagueSkills = requirements.requiredSkills.every((skill) =>
    vagueKeywords.some((vague) =>
      skill.toLowerCase().includes(vague.toLowerCase()),
    ),
  );

  if (hasOnlyVagueSkills) {
    console.log("Vague indicator: Only generic skills found");
    return true;
  }

  if (jobDescription.length < 100) {
    console.log("Vague indicator: Job description too short");
    return true;
  }

  const specificSkills = requirements.requiredSkills.filter(
    (skill) =>
      !vagueKeywords.some((vague) =>
        skill.toLowerCase().includes(vague.toLowerCase()),
      ),
  );

  if (specificSkills.length < 3) {
    console.log(
      `Vague indicator: Only ${specificSkills.length} specific skills`,
    );
    return true;
  }

  return false;
}
