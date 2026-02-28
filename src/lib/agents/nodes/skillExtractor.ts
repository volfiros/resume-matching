import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentStateType } from "../state";

export async function skillExtractorNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const genAI = new GoogleGenerativeAI(state.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { temperature: 0 } });

  const prompt = `Analyze this resume and extract structured information. Return ONLY valid JSON.

Resume:
${state.resumeText}

Return this exact JSON structure:
{
  "candidateName": "Full Name or null if not found",
  "skills": ["skill1", "skill2"],
  "experience": "brief summary of experience",
  "education": "highest education level and field"
}`;

  const response = await model.generateContent(prompt);
  const text = response.response.text().replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(text);

  return {
    candidateName: parsed.candidateName ?? "",
    extractedSkills: parsed.skills ?? [],
    experience: parsed.experience ?? "",
    education: parsed.education ?? "",
  };
}
