import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentStateType } from "../state";

export async function jobAnalyzerNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const genAI = new GoogleGenerativeAI(state.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { temperature: 0 } });

  const prompt = `Analyze this job description and extract requirements. Return ONLY valid JSON.

Job Description:
${state.jobDescription}

Return this exact JSON structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceYears": 3,
  "education": "Bachelor's degree",
  "isVague": false
}

Set isVague to true if the description has fewer than 3 specific technical skills or is under 100 characters.`;

  const response = await model.generateContent(prompt);
  const text = response.response.text().replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(text);

  return { jobRequirements: parsed };
}
