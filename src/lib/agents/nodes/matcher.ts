import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentStateType } from "../state";

export async function matcherNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const genAI = new GoogleGenerativeAI(state.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { temperature: 0 } });

  const prompt = `Compare the candidate's profile against the job requirements. Return ONLY valid JSON.

Candidate Skills: ${state.extractedSkills.join(", ")}
Candidate Experience: ${state.experience}
Candidate Education: ${state.education}

Required Skills: ${state.jobRequirements.requiredSkills.join(", ")}
Preferred Skills: ${state.jobRequirements.preferredSkills.join(", ")}
Required Experience: ${state.jobRequirements.experienceYears ?? "not specified"} years
Required Education: ${state.jobRequirements.education ?? "not specified"}

Rules:
- skillMatches: required skills the candidate has — count semantic equivalents as matches (e.g. "React" matches "React.js", "ML" matches "Machine Learning", "JS" matches "JavaScript", "Node" matches "Node.js")
- skillGaps: required skills the candidate is clearly missing with no equivalent
- preferredMatches: preferred skills the candidate has (same semantic equivalence rules)
- experienceMatch: true only if a years requirement is specified AND the candidate meets it
- educationMatch: true only if an education requirement is specified AND the candidate meets or exceeds it

{
  "skillMatches": ["matched skill1"],
  "skillGaps": ["missing skill1"],
  "preferredMatches": ["preferred skill1"],
  "experienceMatch": true,
  "educationMatch": true
}`;

  const response = await model.generateContent(prompt);
  const text = response.response.text().replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(text);

  return { matchDetails: parsed };
}
