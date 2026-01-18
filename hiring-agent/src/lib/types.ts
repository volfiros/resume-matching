export interface AgentState {
  resumeText?: string;
  jobDescription?: string;
  extractedSkills?: string[];
  requiredSkills?: string[];
  experience?: string;
  education?: string;
  jobRequirements?: {
    requiredSkills: string[];
    preferredSkills: string[];
    experienceYears?: number;
    education?: string;
  };
  matchDetails?: {
    skillMatches: string[];
    skillGaps: string[];
    experienceMatch: boolean;
    educationMatch: boolean;
  };
}

export interface ScreeningResult {
  match_score: number;
  recommendation: string;
  requires_human: boolean;
  confidence: number;
  reasoning_summary: string;
}
