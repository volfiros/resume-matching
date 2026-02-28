import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  resumeText: Annotation<string>({ reducer: (_, b) => b }),
  jobDescription: Annotation<string>({ reducer: (_, b) => b }),
  geminiApiKey: Annotation<string>({ reducer: (_, b) => b }),
  candidateName: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  extractedSkills: Annotation<string[]>({ reducer: (_, b) => b, default: () => [] }),
  experience: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  education: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  jobRequirements: Annotation<{
    requiredSkills: string[];
    preferredSkills: string[];
    experienceYears?: number;
    education?: string;
    isVague?: boolean;
  }>({
    reducer: (_, b) => b,
    default: () => ({ requiredSkills: [], preferredSkills: [] }),
  }),
  matchDetails: Annotation<{
    skillMatches: string[];
    skillGaps: string[];
    preferredMatches: string[];
    experienceMatch: boolean;
    educationMatch: boolean;
  }>({
    reducer: (_, b) => b,
    default: () => ({
      skillMatches: [],
      skillGaps: [],
      preferredMatches: [],
      experienceMatch: false,
      educationMatch: false,
    }),
  }),
  result: Annotation<{
    matchScore: number;
    confidence: number;
    recommendation: string;
    requiresHuman: boolean;
    reasoning: string;
  } | null>({
    reducer: (_, b) => b,
    default: () => null,
  }),
});

export type AgentStateType = typeof AgentState.State;
