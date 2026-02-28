import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentStateType } from "../state";

export async function decisionMakerNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (state.jobRequirements.isVague) {
    return {
      result: {
        matchScore: 0,
        confidence: 0,
        recommendation: "Needs manual review",
        requiresHuman: true,
        reasoning: "Job description is too vague to perform accurate matching. Human review required.",
      },
    };
  }

  const { skillMatches, skillGaps, preferredMatches, experienceMatch, educationMatch } = state.matchDetails;
  const { requiredSkills, preferredSkills, experienceYears, education } = state.jobRequirements;

  const totalRequired = requiredSkills.length;
  const totalPreferred = preferredSkills.length;

  const requiredRatio = totalRequired > 0
    ? Math.min(1, skillMatches.length / totalRequired)
    : 1.0;

  const preferredRatio = totalPreferred > 0
    ? Math.min(1, preferredMatches.length / totalPreferred)
    : 0;

  const experienceScore = experienceYears ? (experienceMatch ? 1.0 : 0.25) : 0.5;
  const educationScore = (education && education !== "not specified") ? (educationMatch ? 1.0 : 0.35) : 0.5;

  const matchScore = Math.min(1, Math.max(0,
    requiredRatio * 0.55 +
    preferredRatio * 0.15 +
    experienceScore * 0.2 +
    educationScore * 0.1
  ));

  const specifiedDimensions = [
    totalRequired > 0,
    experienceYears !== undefined,
    Boolean(education && education !== "not specified"),
  ].filter(Boolean).length;
  const confidence = Math.round((0.5 + (specifiedDimensions / 3) * 0.5) * 100) / 100;

  let recommendation: string;
  let requiresHuman: boolean;
  if (matchScore >= 0.65) {
    recommendation = "Proceed to interview";
    requiresHuman = false;
  } else if (matchScore >= 0.35) {
    recommendation = "Needs manual review";
    requiresHuman = true;
  } else {
    recommendation = "Reject";
    requiresHuman = false;
  }

  const genAI = new GoogleGenerativeAI(state.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { temperature: 0 } });

  const reasoningPrompt = `Write a concise 2-sentence hiring assessment for this candidate. Be factual and specific.

Outcome: ${recommendation} (match score: ${Math.round(matchScore * 100)}%)
Matched required skills: ${skillMatches.join(", ") || "none"}
Missing required skills: ${skillGaps.join(", ") || "none"}
Matched preferred skills: ${preferredMatches.join(", ") || "none"}
Experience match: ${experienceMatch}
Education match: ${educationMatch}

Return only the 2-sentence assessment, no JSON.`;

  const response = await model.generateContent(reasoningPrompt);
  const reasoning = response.response.text().trim();

  return {
    result: {
      matchScore: Math.round(matchScore * 100) / 100,
      confidence,
      recommendation,
      requiresHuman,
      reasoning,
    },
  };
}
